import React, { useEffect, useState } from 'react';
import { useAuth } from '../services/authContext';
import { db } from '../services/db';
import { useNavigate, Navigate, useParams } from 'react-router-dom';
import { CATEGORIES, MALAYSIAN_STATES } from '../constants';
import { Listing } from '../types';
import toast from 'react-hot-toast';
import { compressImages } from '../services/imageCompression';
import { supabase } from '../services/supabaseClient';

const CreateListing: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { id: editId } = useParams();
  const isEditMode = !!editId;
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(false);
  const [existingListing, setExistingListing] = useState<Listing | null>(null);

  // Form State
  const [category, setCategory] = useState<string>('Panels');
  const [title, setTitle] = useState('');
  const [brand, setBrand] = useState('');
  const [price, setPrice] = useState('');
  const [state, setState] = useState('Selangor');
  const [condition, setCondition] = useState<'New' | 'Used' | 'Refurbished'>('Used');
  const [images, setImages] = useState<File[]>([]);
  
  // Dynamic Specs State
  const [specs, setSpecs] = useState<any>({});

  if (!isAuthenticated) return <Navigate to="/login" />;
  if (user && (user.tier === 'UNSUBSCRIBED' || !user.is_verified)) {
    toast.error(user.tier === 'UNSUBSCRIBED' ? "Please subscribe to a plan before posting." : "You must be verified to post.");
    return <Navigate to={user.tier === 'UNSUBSCRIBED' ? "/pricing" : "/dashboard"} />;
  }

  const getListingLimit = (tier: any) => {
    switch (tier) {
      case 'UNSUBSCRIBED': return 0;
      case 'STARTER': return 1;
      case 'PRO': return 10;
      case 'MERCHANT': return 30;
      case 'ENTERPRISE': return 100;
      default: return 0;
    }
  };

  const [slotBlocked, setSlotBlocked] = useState(false);

  useEffect(() => {
    if (isEditMode) return;
    if (!user) return;

    let cancelled = false;
    const run = async () => {
      try {
        const mine = await db.getListingsBySellerId(user.id);
        if (cancelled) return;

        const nowMs = Date.now();
        const activeUsed = (mine || []).filter((l: any) => {
          const activeUntilMs = new Date(l.active_until).getTime();
          return !l.is_hidden && !l.is_sold && activeUntilMs > nowMs;
        }).length;

        const limit = getListingLimit((user as any).tier);
        if (activeUsed >= limit) {
          setSlotBlocked(true);
          toast.error(`You have reached your plan limit (${activeUsed}/${limit}). Deactivate a listing to add a new one.`);
          navigate('/dashboard', { replace: true });
        } else {
          setSlotBlocked(false);
        }
      } catch (e) {
        console.error(e);
      }
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [isEditMode, navigate, user]);

  useEffect(() => {
    if (!isEditMode || !editId) return;
    if (!user) return;

    let cancelled = false;
    const run = async () => {
      setInitialLoading(true);
      try {
        const row = await db.getListingById(editId);
        if (cancelled) return;
        if (!row) {
          toast.error('Listing not found');
          navigate('/dashboard', { replace: true });
          return;
        }
        if (row.seller_id !== user.id) {
          toast.error('Not authorized to edit this listing');
          navigate('/dashboard', { replace: true });
          return;
        }

        setExistingListing(row);
        setCategory(row.category === 'Accessories' ? 'Miscellaneous' : row.category);
        setTitle(row.title);
        setBrand(row.brand || '');
        setPrice(String(row.price_rm ?? ''));
        setState(row.location_state || 'Selangor');
        setCondition(((row as any).condition as any) || 'Used');
        setSpecs((row.specs || {}) as any);
      } catch (e) {
        console.error(e);
        toast.error('Failed to load listing');
      } finally {
        if (!cancelled) setInitialLoading(false);
      }
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [editId, isEditMode, navigate, user]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;

    const filesArray: File[] = Array.from(e.target.files);
    const totalCount = images.length + filesArray.length;
    if (totalCount > 10) {
      toast.error(`Max 10 images allowed. You already have ${images.length} images selected.`);
      return;
    }

    try {
      toast.loading('Optimizing images...', { id: 'compress_images' });
      const compressed = await compressImages(filesArray, {
        maxBytes: 300 * 1024,
        maxWidth: 1600,
        maxHeight: 1600,
        outputType: 'image/webp'
      });
      setImages(prev => [...prev, ...compressed]);
      toast.success('Images optimized', { id: 'compress_images' });
    } catch (err) {
      console.error(err);
      toast.error('Failed to optimize images', { id: 'compress_images' });
      setImages(filesArray);
    }
  };

  const handleSpecChange = (key: string, value: string | number) => {
    setSpecs(prev => ({ ...prev, [key]: value }));
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value;
      if (val.length <= 80) {
          setTitle(val);
      }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (slotBlocked) {
      toast.error('You have reached your plan limit.');
      return;
    }
    setLoading(true);

    try {
        const uploadListingImages = async (files: File[]): Promise<string[]> => {
          const urls: string[] = [];
          if (!files.length) return urls;

          // Validate file types and sizes
          const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
          const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
          
          for (const file of files) {
            if (!ALLOWED_TYPES.includes(file.type)) {
              throw new Error(`Invalid file type: ${file.name}. Only JPG, PNG, WebP, GIF allowed.`);
            }
            if (file.size > MAX_FILE_SIZE) {
              throw new Error(`File too large: ${file.name}. Max size is 10MB.`);
            }
          }

          toast.loading('Uploading images...', { id: 'upload_listing_images' });

          for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const fileExt = (file.name.split('.').pop() || 'webp').toLowerCase();
            const filePath = `${user!.id}/listing_${Date.now()}_${i}.${fileExt}`;

            const { error: uploadError } = await supabase.storage
              .from('listing-images')
              .upload(filePath, file);
            if (uploadError) throw uploadError;

            const { data } = supabase.storage
              .from('listing-images')
              .getPublicUrl(filePath);

            if (!data?.publicUrl) throw new Error('image_public_url_missing');
            urls.push(data.publicUrl);
          }

          toast.success('Images uploaded', { id: 'upload_listing_images' });
          return urls;
        };

        const hasNewImages = images.length > 0;
        const uploadedImageUrls = hasNewImages ? await uploadListingImages(images) : [];

        if (isEditMode) {
          if (!existingListing) {
            throw new Error('edit_missing_listing');
          }

          const updated: Listing = {
            ...existingListing,
            title,
            category: (category === 'Miscellaneous' ? 'Miscellaneous' : category) as any,
            brand,
            condition,
            specs,
            price_rm: parseFloat(price),
            location_state: state,
            images_url: hasNewImages ? (uploadedImageUrls.length ? uploadedImageUrls : existingListing.images_url) : existingListing.images_url,
          };

          await db.updateListing(updated);
          toast.success('Listing updated!');
          navigate('/dashboard');
          return;
        }

        const imageUrls = uploadedImageUrls.length
          ? uploadedImageUrls
          : ['https://via.placeholder.com/800x600?text=No+Image'];

        const listingData = {
          seller_id: user!.id,
          title,
          category: (category === 'Miscellaneous' ? 'Miscellaneous' : category) as any,
          brand,
          condition,
          specs,
          price_rm: parseFloat(price),
          location_state: state,
          images_url: imageUrls,
          is_sold: false,
          is_hidden: false
        };

        const ok = await db.createListing(listingData);
        if (!ok) {
          throw new Error('createListing_failed');
        }
        toast.success("Listing published successfully!");
        navigate('/dashboard');
    } catch (error) {
        toast.error(isEditMode ? 'Failed to update listing.' : "Failed to create listing.");
        console.error(error);
    } finally {
        setLoading(false);
    }
  };

  // Helper calculation for Price/Watt
  const showPricePerWatt = category === 'Panels' && price && specs.wattage;
  const pricePerWatt = showPricePerWatt ? (parseFloat(price) / specs.wattage).toFixed(2) : null;

  // Render Dynamic Form Fields
  const renderSpecFields = () => {
    switch (category) {
      case 'Panels':
        return (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input label="Wattage (W)" type="number" onChange={(v) => handleSpecChange('wattage', Number(v))} required />
              <Input label="Efficiency (%)" type="number" onChange={(v) => handleSpecChange('efficiency', Number(v))} required />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input label="Model" placeholder="e.g. JAM72S30" onChange={(v) => handleSpecChange('model', v)} />
              <Input label="Product Warranty (Years)" type="number" onChange={(v) => handleSpecChange('warranty_years', Number(v))} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Cell Type</label>
                  <select onChange={(e) => handleSpecChange('cell_type', e.target.value)} className="w-full border border-slate-300 dark:border-slate-700 rounded-md p-2 text-sm focus:ring-primary focus:border-primary bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100">
                    <option value="">Select Type</option>
                    <option value="Monocrystalline">Monocrystalline</option>
                    <option value="Polycrystalline">Polycrystalline</option>
                    <option value="N-type">N-type</option>
                    <option value="P-type">P-type</option>
                    <option value="IBC">IBC</option>
                    <option value="ABC">ABC</option>
                    <option value="TOPCon">TOPCon</option>
                    <option value="HJT">HJT</option>
                    <option value="PERC">PERC</option>
                    <option value="Bifacial">Bifacial</option>
                    <option value="Monofacial">Monofacial</option>
                    <option value="Thin-Film">Thin-Film</option>
                    <option value="Standard Rigid">Standard Rigid</option>
                    <option value="Flexible">Flexible</option>
                    <option value="BIPV">BIPV</option>
                    <option value="Shingled">Shingled</option>
                  </select>
               </div>
               <Input label="Dimensions (mm)" placeholder="e.g. 2278x1134x30" onChange={(v) => handleSpecChange('dimensions', v)} required />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input label="Voc (V)" type="number" onChange={(v) => handleSpecChange('voc_v', Number(v))} />
              <Input label="Isc (A)" type="number" onChange={(v) => handleSpecChange('isc_a', Number(v))} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input label="Vmp (V)" type="number" onChange={(v) => handleSpecChange('vmp_v', Number(v))} />
              <Input label="Imp (A)" type="number" onChange={(v) => handleSpecChange('imp_a', Number(v))} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input label="Max System Voltage (V)" type="number" onChange={(v) => handleSpecChange('max_system_voltage_v', Number(v))} />
              <Input label="Max Fuse Rating (A)" type="number" onChange={(v) => handleSpecChange('max_fuse_rating_a', Number(v))} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input label="Temp Coeff Pmax (%/°C)" type="number" onChange={(v) => handleSpecChange('temp_coeff_pmax_pct_per_c', Number(v))} />
              <Input label="Weight (kg)" type="number" onChange={(v) => handleSpecChange('weight_kg', Number(v))} />
            </div>
          </>
        );
      case 'Inverters':
        return (
          <>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <Input label="Model" placeholder="e.g. SUN2000" onChange={(v) => handleSpecChange('model', v)} />
               <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Inverter Type</label>
                  <select value={String((specs as any).inverter_type || '')} onChange={(e) => handleSpecChange('inverter_type', e.target.value)} className="w-full border border-slate-300 dark:border-slate-700 rounded-md p-2 text-sm focus:ring-primary focus:border-primary bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100">
                    <option value="">Select Type</option>
                    <option value="String">String</option>
                    <option value="Micro">Micro</option>
                    <option value="Microinverter">Microinverter</option>
                    <option value="Hybrid">Hybrid</option>
                    <option value="Off-Grid">Off-Grid</option>
                    <option value="Grid-Tied">Grid-Tied</option>
                    <option value="Central">Central</option>
                  </select>
               </div>
               <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Phase</label>
                  <select onChange={(e) => handleSpecChange('phase', e.target.value)} className="w-full border border-slate-300 dark:border-slate-700 rounded-md p-2 text-sm focus:ring-primary focus:border-primary bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100">
                    <option value="Single">Single Phase</option>
                    <option value="Three">Three Phase</option>
                  </select>
               </div>
               <Input label="Max Input Voltage (V)" type="number" onChange={(v) => handleSpecChange('max_input_voltage', Number(v))} />
             </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <Input label="Efficiency (%)" type="number" onChange={(v) => handleSpecChange('efficiency', Number(v))} />
               <Input label="Product Warranty (Years)" type="number" onChange={(v) => handleSpecChange('warranty_years', Number(v))} />
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <Input label="Rated AC Power (kW)" type="number" onChange={(v) => handleSpecChange('rated_ac_power_kw', Number(v))} />
               <Input label="Max AC Power (kW)" type="number" onChange={(v) => handleSpecChange('max_ac_power_kw', Number(v))} />
             </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <Input label="MPPT Count" type="number" onChange={(v) => handleSpecChange('mppt_count', Number(v))} />
               <Input label="Max DC Power (kW)" type="number" onChange={(v) => handleSpecChange('max_dc_power_kw', Number(v))} />
             </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <Input label="Protection Rating" placeholder="e.g. IP65" onChange={(v) => handleSpecChange('protection_rating', v)} />
               <Input label="Weight (kg)" type="number" onChange={(v) => handleSpecChange('weight_kg', Number(v))} />
             </div>
          </>
        );
      case 'Batteries':
        return (
          <>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <Input label="Model" placeholder="e.g. LFP-10kWh" onChange={(v) => handleSpecChange('model', v)} />
               <Input label="Capacity (kWh)" type="number" onChange={(v) => handleSpecChange('capacity_kwh', Number(v))} />
               <Input label="Nominal Voltage (V)" type="number" onChange={(v) => handleSpecChange('nominal_voltage', Number(v))} />
             </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <Input label="Cycle Life" type="number" onChange={(v) => handleSpecChange('cycle_life', Number(v))} />
               <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Type</label>
                  <select value={String((specs as any).battery_type || '')} onChange={(e) => handleSpecChange('battery_type', e.target.value)} className="w-full border border-slate-300 dark:border-slate-700 rounded-md p-2 text-sm focus:ring-primary focus:border-primary bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100">
                    <option value="">Select Type</option>
                    <option value="Rack-mounted">Rack-mounted</option>
                    <option value="Wall-mounted">Wall-mounted</option>
                    <option value="Portable">Portable</option>
                    <option value="Container">Container</option>
                    <option value="Floor-standing">Floor-standing</option>
                    <option value="All-in-one">All-in-one</option>
                  </select>
               </div>
               <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Technology</label>
                  <select value={String((specs as any).technology || '')} onChange={(e) => handleSpecChange('technology', e.target.value)} className="w-full border border-slate-300 dark:border-slate-700 rounded-md p-2 text-sm focus:ring-primary focus:border-primary bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100">
                    <option value="">Select Technology</option>
                    <option value="LiFePO4">LiFePO4</option>
                    <option value="NMC">NMC</option>
                    <option value="LTO">LTO</option>
                    <option value="Lead-Acid">Lead-Acid</option>
                    <option value="AGM">AGM</option>
                    <option value="Gel">Gel</option>
                    <option value="Sodium-Ion">Sodium-Ion</option>
                    <option value="Flow">Flow</option>
                    <option value="Other">Other</option>
                  </select>
               </div>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <Input label="Usable Capacity (kWh)" type="number" onChange={(v) => handleSpecChange('usable_capacity_kwh', Number(v))} />
               <Input label="Product Warranty (Years)" type="number" onChange={(v) => handleSpecChange('warranty_years', Number(v))} />
             </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <Input label="Max Charge (kW)" type="number" onChange={(v) => handleSpecChange('max_charge_kw', Number(v))} />
               <Input label="Max Discharge (kW)" type="number" onChange={(v) => handleSpecChange('max_discharge_kw', Number(v))} />
             </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <Input label="Depth of Discharge (%)" type="number" onChange={(v) => handleSpecChange('depth_of_discharge_pct', Number(v))} />
               <Input label="Protection Rating" placeholder="e.g. IP55" onChange={(v) => handleSpecChange('protection_rating', v)} />
             </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <Input label="Dimensions (mm)" placeholder="e.g. 500x650x200" onChange={(v) => handleSpecChange('dimensions', v)} />
               <Input label="Weight (kg)" type="number" onChange={(v) => handleSpecChange('weight_kg', Number(v))} />
             </div>
          </>
        );
      case 'Cable':
        return (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Current Type</label>
                <select
                  value={String((specs as any).current_type || '')}
                  onChange={(e) => handleSpecChange('current_type', e.target.value)}
                  className="w-full border border-slate-300 dark:border-slate-700 rounded-md p-2 text-sm focus:ring-primary focus:border-primary bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100"
                >
                  <option value="">Select Type</option>
                  <option value="DC">DC</option>
                  <option value="AC">AC</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Cable Type</label>
                <select
                  value={String((specs as any).cable_type || '')}
                  onChange={(e) => handleSpecChange('cable_type', e.target.value)}
                  className="w-full border border-slate-300 dark:border-slate-700 rounded-md p-2 text-sm focus:ring-primary focus:border-primary bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100"
                >
                  <option value="">Select Type</option>
                  <option value="PV1-F">PV1-F</option>
                  <option value="H1Z2Z2-K">H1Z2Z2-K</option>
                  <option value="USE-2">USE-2</option>
                  <option value="PV Wire">PV Wire</option>
                  <option value="THHN">THHN</option>
                  <option value="H05VV-F">H05VV-F</option>
                  <option value="N2XH">N2XH</option>
                  <option value="Battery Cable">Battery Cable</option>
                  <option value="MV Cable">MV Cable</option>
                  <option value="RHW-2">RHW-2</option>
                  <option value="THWN-2">THWN-2</option>
                </select>
              </div>
              <Input label="Size (mm²)" type="number" onChange={(v) => handleSpecChange('size_mm2', Number(v))} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input label="Cores" type="number" onChange={(v) => handleSpecChange('cores', Number(v))} />
              <Input label="Length (m)" type="number" onChange={(v) => handleSpecChange('length_m', Number(v))} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Voltage Rating</label>
                <select
                  value={String((specs as any).voltage_rating || '')}
                  onChange={(e) => handleSpecChange('voltage_rating', e.target.value)}
                  className="w-full border border-slate-300 dark:border-slate-700 rounded-md p-2 text-sm focus:ring-primary focus:border-primary bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100"
                >
                  <option value="">Select Voltage</option>
                  <option value="600V">600V</option>
                  <option value="1000V">1000V</option>
                  <option value="1500V">1500V</option>
                  <option value="1800V">1800V</option>
                  <option value="2000V">2000V</option>
                  <option value="0.6/1kV">0.6/1kV</option>
                  <option value="450/750V">450/750V</option>
                  <option value="1.8/3kV">1.8/3kV</option>
                  <option value="6.35/11kV">6.35/11kV</option>
                  <option value="19/33kV">19/33kV</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Insulation</label>
                <select
                  value={String((specs as any).insulation || '')}
                  onChange={(e) => handleSpecChange('insulation', e.target.value)}
                  className="w-full border border-slate-300 dark:border-slate-700 rounded-md p-2 text-sm focus:ring-primary focus:border-primary bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100"
                >
                  <option value="">Select Insulation</option>
                  <option value="XLPE">XLPE</option>
                  <option value="XLPO">XLPO</option>
                  <option value="PVC">PVC</option>
                  <option value="Halogen-Free">Halogen-Free</option>
                  <option value="LSHF">LSHF</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Conductor</label>
              <select
                value={String((specs as any).conductor || '')}
                onChange={(e) => handleSpecChange('conductor', e.target.value)}
                className="w-full border border-slate-300 dark:border-slate-700 rounded-md p-2 text-sm focus:ring-primary focus:border-primary bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100"
              >
                <option value="">Select Conductor</option>
                <option value="Copper">Copper</option>
                <option value="Tinned Copper">Tinned Copper</option>
                <option value="Aluminum">Aluminum</option>
                <option value="Tinned Copper-Clad Aluminum (TCCA)">Tinned Copper-Clad Aluminum (TCCA)</option>
                <option value="Aluminum Alloy">Aluminum Alloy</option>
              </select>
            </div>
          </>
        );
      case 'Protective':
        return (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Device Type</label>
                <select
                  value={String((specs as any).device_type || '')}
                  onChange={(e) => handleSpecChange('device_type', e.target.value)}
                  className="w-full border border-slate-300 dark:border-slate-700 rounded-md p-2 text-sm focus:ring-primary focus:border-primary bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100"
                >
                  <option value="">Select Type</option>
                  <option value="Fuse">Fuse</option>
                  <option value="Breaker">Breaker</option>
                  <option value="SPD">SPD</option>
                  <option value="Isolator">Isolator</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <Input label="Poles" type="number" placeholder="Enter 0 if no poles" onChange={(v) => handleSpecChange('poles', Number(v))} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input label="Rated Current (A)" type="number" onChange={(v) => handleSpecChange('rated_current_a', Number(v))} />
              <Input label="Rated Voltage (V)" type="number" onChange={(v) => handleSpecChange('rated_voltage_v', Number(v))} />
            </div>
          </>
        );
      case 'Miscellaneous':
      default:
        return <p className="text-sm text-slate-500 dark:text-slate-400 italic">No specific fields for this category.</p>;
    }
  };

  if (initialLoading) return <div className="text-slate-500 dark:text-slate-400">Loading...</div>;

  return (
    <div className="max-w-3xl mx-auto bg-white dark:bg-slate-900 p-8 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
      <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-6">{isEditMode ? 'Edit Listing' : 'List New Equipment'}</h1>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Core Info */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-slate-700 dark:text-slate-200 border-b border-slate-200 dark:border-slate-800 pb-2">Basic Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
             <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Category</label>
                <select 
                  value={category} 
                  onChange={(e) => { setCategory(e.target.value); setSpecs({}); }} 
                  className="w-full border border-slate-300 dark:border-slate-700 rounded-lg p-2.5 focus:ring-primary focus:border-primary bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100"
                >
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
             </div>
             <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Location (State)</label>
                <select 
                  value={state} 
                  onChange={(e) => setState(e.target.value)} 
                  className="w-full border border-slate-300 dark:border-slate-700 rounded-lg p-2.5 focus:ring-primary focus:border-primary bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100"
                >
                  {MALAYSIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
             </div>
             <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Condition</label>
                <select 
                  value={condition}
                  onChange={(e) => setCondition(e.target.value as any)}
                  className="w-full border border-slate-300 dark:border-slate-700 rounded-lg p-2.5 focus:ring-primary focus:border-primary bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100"
                >
                  <option value="New">New</option>
                  <option value="Used">Used</option>
                  <option value="Refurbished">Refurbished</option>
                </select>
             </div>
          </div>

          <div>
             <div className="flex justify-between items-center mb-1">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Listing Title</label>
                <span className={`text-xs ${title.length >= 70 ? 'text-amber-600 font-bold' : 'text-slate-400'}`}>
                   {title.length}/80
                </span>
             </div>
             <input 
               type="text" 
               className="w-full border border-slate-300 dark:border-slate-700 rounded-lg p-2.5 focus:ring-primary focus:border-primary outline-none transition-all bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
               placeholder="e.g. JA Solar 550W Panel (Used)"
               required
               value={title}
               onChange={handleTitleChange}
             />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Brand" placeholder="e.g. Huawei, Jinko" value={brand} onChange={setBrand} required />
            <div>
                <Input label="Price (RM)" type="number" placeholder="0.00" value={price} onChange={setPrice} required />
                {showPricePerWatt && (
                    <p className="text-xs text-emerald-600 font-bold mt-1 text-right">
                       ≈ RM {pricePerWatt}/Watt
                    </p>
                )}
            </div>
          </div>
        </div>

        {/* Dynamic Specs */}
        <div className="space-y-4">
           <h2 className="text-lg font-semibold text-slate-700 dark:text-slate-200 border-b border-slate-200 dark:border-slate-800 pb-2">Technical Specifications</h2>
           <div className="bg-slate-50 dark:bg-slate-950/40 p-6 rounded-lg border border-slate-200 dark:border-slate-800 space-y-4">
              {renderSpecFields()}
           </div>
        </div>

        {/* Images */}
        <div className="space-y-4">
           <h2 className="text-lg font-semibold text-slate-700 dark:text-slate-200 border-b border-slate-200 dark:border-slate-800 pb-2">Images</h2>
           <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-lg p-8 text-center hover:bg-slate-50 dark:hover:bg-slate-950/40 transition-colors cursor-pointer relative">
              <input 
                type="file" 
                multiple 
                accept="image/*" 
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div className="text-slate-500 dark:text-slate-400">
                <span className="text-primary font-medium">Click to upload</span> or drag and drop<br/>
                <span className="text-xs">Max 10 images. Formats: JPG, PNG.</span>
              </div>
           </div>
           {images.length > 0 && (
             <div className="text-sm text-slate-600 dark:text-slate-300">
               {images.length} file(s) selected
             </div>
           )}
        </div>

        <div className="pt-4">
           <button 
             type="submit" 
             disabled={loading}
             className="w-full bg-primary text-white font-bold py-3 px-4 rounded-lg hover:bg-emerald-600 transition-colors shadow-lg shadow-emerald-200 disabled:opacity-70"
           >
             {loading ? 'Publishing...' : 'Publish Listing'}
           </button>
        </div>
      </form>
    </div>
  );
};

// Helper Input Component
const Input: React.FC<{
  label: string; 
  type?: string; 
  placeholder?: string; 
  required?: boolean;
  value?: string | number;
  onChange: (val: string) => void;
}> = ({ label, type = "text", placeholder, required, value, onChange }) => (
  <div>
    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{label}</label>
    <input 
      type={type} 
      className="w-full border border-slate-300 dark:border-slate-700 rounded-lg p-2.5 focus:ring-primary focus:border-primary outline-none transition-all bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
      placeholder={placeholder}
      required={required}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  </div>
);

export default CreateListing;