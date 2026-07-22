import React, { useEffect, useState } from 'react';
import { supabase } from '../services/supabaseClient';
import { DiscussionPost, DiscussionComment, DiscussionCategory } from '../types/discussion';
import { CreateDiscussionModal } from '../components/discussion/CreateDiscussionModal';
import { MessageSquare, Flame, ShieldCheck, Globe, Plus, Send, ChevronDown, ChevronUp } from 'lucide-react';

const FALLBACK_DISCUSSIONS: DiscussionPost[] = [
  {
    id: 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    user_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    title: 'Enphase IQ8 vs SolarEdge Inverter: Which handles partial shading better?',
    content: 'I have a giant oak tree east of my roof. In the morning, 3 out of 16 panels get shaded. Is it worth paying extra for microinverters or should I go with SolarEdge optimizers?',
    category: 'hardware',
    upvotes_count: 14,
    is_dummy: true,
    created_at: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
    profiles: {
      id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
      username: 'socal_sam',
      display_name: 'Sam Miller',
      avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      country_code: 'US',
      city_region: 'Los Angeles',
      system_kwp: 8.50,
      panel_brand: 'Qcells (Hanwha)',
      inverter_brand: 'Enphase Energy',
      role: 'consumer',
      is_dummy: true,
      created_at: new Date().toISOString(),
    },
  },
  {
    id: 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
    user_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
    title: 'Yield dropping around 2 PM every sunny afternoon - thermal throttling?',
    content: 'Notice a sudden 20% power drop on bright sunny days around 2 PM in London. Inverter is mounted inside my garage. Could heat be clipping the output?',
    category: 'troubleshooting',
    upvotes_count: 8,
    is_dummy: true,
    created_at: new Date(Date.now() - 6 * 3600 * 1000).toISOString(),
    profiles: {
      id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
      username: 'london_solar',
      display_name: 'Oliver Smith',
      avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      country_code: 'GB',
      city_region: 'London',
      system_kwp: 4.20,
      panel_brand: 'REC Group',
      inverter_brand: 'SolarEdge',
      role: 'consumer',
      is_dummy: true,
      created_at: new Date().toISOString(),
    },
  },
];

const FALLBACK_COMMENTS: Record<string, DiscussionComment[]> = {
  'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11': [
    {
      id: 'c1',
      discussion_id: 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
      user_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33',
      content: 'For partial morning shade, Enphase IQ8 microinverters isolate the shaded panels completely without affecting string voltage. SolarEdge optimizers do a great job too, but IQ8s give you no single point of inverter failure.',
      is_dummy: true,
      created_at: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
      profiles: {
        id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33',
        username: 'sydney_pv_pro',
        display_name: 'Shane (Sydney PV)',
        avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
        country_code: 'AU',
        city_region: 'Sydney',
        system_kwp: 10.00,
        panel_brand: 'Jinko Solar',
        inverter_brand: 'Fronius',
        role: 'installer',
        is_dummy: true,
        created_at: new Date().toISOString(),
      },
    },
  ],
  'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22': [
    {
      id: 'c2',
      discussion_id: 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
      user_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33',
      content: 'Check your garage ambient temperature! Most string inverters start thermal derating above 45°C (113°F). Installing a small external cooling fan near the heat sink usually fixes this completely.',
      is_dummy: true,
      created_at: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
      profiles: {
        id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33',
        username: 'sydney_pv_pro',
        display_name: 'Shane (Sydney PV)',
        avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
        country_code: 'AU',
        city_region: 'Sydney',
        system_kwp: 10.00,
        panel_brand: 'Jinko Solar',
        inverter_brand: 'Fronius',
        role: 'installer',
        is_dummy: true,
        created_at: new Date().toISOString(),
      },
    },
  ],
};

export const Discussion: React.FC = () => {
  const [posts, setPosts] = useState<DiscussionPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [expandedPostId, setExpandedPostId] = useState<string | null>(null);
  const [commentsMap, setCommentsMap] = useState<Record<string, DiscussionComment[]>>({});
  const [newCommentText, setNewCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);

  useEffect(() => {
    fetchPosts();
  }, [activeCategory]);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('discussions')
        .select(`
          *,
          profiles!inner (
            id, username, display_name, avatar_url, country_code, city_region, inverter_brand, panel_brand, role, is_dummy
          )
        `)
        .order('created_at', { ascending: false });

      if (activeCategory !== 'all') {
        query = query.eq('category', activeCategory);
      }

      const { data, error } = await query;
      if (!error && data && data.length > 0) {
        setPosts(data as DiscussionPost[]);
      } else {
        let filtered = [...FALLBACK_DISCUSSIONS];
        if (activeCategory !== 'all') filtered = filtered.filter(p => p.category === activeCategory);
        setPosts(filtered);
      }
    } catch (err) {
      console.warn('Discussion fetch warning, using fallback dataset:', err);
      let filtered = [...FALLBACK_DISCUSSIONS];
      if (activeCategory !== 'all') filtered = filtered.filter(p => p.category === activeCategory);
      setPosts(filtered);
    } finally {
      setLoading(false);
    }
  };

  const toggleComments = async (postId: string) => {
    if (expandedPostId === postId) {
      setExpandedPostId(null);
      return;
    }
    setExpandedPostId(postId);

    if (!commentsMap[postId]) {
      try {
        const { data } = await supabase
          .from('discussion_comments')
          .select(`
            *,
            profiles!inner (
              id, display_name, avatar_url, country_code, role
            )
          `)
          .eq('discussion_id', postId)
          .order('created_at', { ascending: true });

        if (data && data.length > 0) {
          setCommentsMap((prev) => ({ ...prev, [postId]: data as DiscussionComment[] }));
        } else {
          setCommentsMap((prev) => ({ ...prev, [postId]: FALLBACK_COMMENTS[postId] || [] }));
        }
      } catch (err) {
        setCommentsMap((prev) => ({ ...prev, [postId]: FALLBACK_COMMENTS[postId] || [] }));
      }
    }
  };

  const handleAddComment = async (postId: string) => {
    if (!newCommentText.trim()) return;
    setSubmittingComment(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        alert('Please sign in to reply.');
        setSubmittingComment(false);
        return;
      }

      const { error } = await supabase.from('discussion_comments').insert({
        discussion_id: postId,
        user_id: user.id,
        content: newCommentText,
        is_dummy: false,
      });

      if (error) throw error;

      setNewCommentText('');
      const { data } = await supabase
        .from('discussion_comments')
        .select(`*, profiles!inner(id, display_name, avatar_url, country_code, role)`)
        .eq('discussion_id', postId)
        .order('created_at', { ascending: true });

      if (data) {
        setCommentsMap((prev) => ({ ...prev, [postId]: data as DiscussionComment[] }));
      }
    } catch (err: any) {
      alert(err.message || 'Failed to post reply.');
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleUpvote = async (postId: string, currentCount: number) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        alert('Please sign in to upvote discussions.');
        return;
      }

      const { error } = await supabase.from('discussion_upvotes').insert({
        discussion_id: postId,
        user_id: user.id,
      });

      if (!error) {
        await supabase.from('discussions').update({ upvotes_count: currentCount + 1 }).eq('id', postId);
        fetchPosts();
      }
    } catch (err) {
      // Local optimistic update
      setPosts((prev) =>
        prev.map((p) => (p.id === postId ? { ...p, upvotes_count: p.upvotes_count + 1 } : p))
      );
    }
  };

  const getCategoryBadge = (cat: DiscussionCategory) => {
    switch (cat) {
      case 'troubleshooting': return <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] px-2 py-0.5 rounded-full font-semibold">⚡ Troubleshooting</span>;
      case 'hardware': return <span className="bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[10px] px-2 py-0.5 rounded-full font-semibold">🔍 Hardware Review</span>;
      case 'tips': return <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] px-2 py-0.5 rounded-full font-semibold">💡 ROI & Tips</span>;
      default: return <span className="bg-slate-800 text-slate-300 border border-slate-700 text-[10px] px-2 py-0.5 rounded-full font-semibold">💬 General</span>;
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-6 text-slate-100">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-2xl">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-amber-400"/> Solar Community & Q&A
          </h1>
          <p className="text-xs text-slate-400 mt-1">Troubleshoot equipment, compare brands, and ask installer pros</p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-extrabold rounded-xl shadow-lg transition-all text-xs uppercase tracking-wider shrink-0"
        >
          <Plus className="w-4 h-4"/> Ask Question / Start Topic
        </button>
      </div>

      {/* Category Pills Filter */}
      <div className="flex flex-wrap gap-2">
        {[
          { id: 'all', label: '🌐 All Discussions' },
          { id: 'troubleshooting', label: '⚡ Troubleshooting' },
          { id: 'hardware', label: '🔍 Hardware & Gear' },
          { id: 'tips', label: '💡 Tips & ROI' },
          { id: 'general', label: '💬 General' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveCategory(tab.id)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
              activeCategory === tab.id
                ? 'bg-amber-500/10 border-amber-500/40 text-amber-400'
                : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Posts Feed */}
      {loading ? (
        <div className="text-center py-16 text-slate-500 text-sm">Loading community feed...</div>
      ) : posts.length === 0 ? (
        <div className="text-center py-16 bg-slate-900/40 border border-slate-800 rounded-2xl text-slate-500 text-sm">
          No discussion topics in this category yet. Be the first to ask!
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => {
            const isExpanded = expandedPostId === post.id;
            const comments = commentsMap[post.id] || [];

            return (
              <div key={post.id} className="bg-slate-900 border border-slate-800 rounded-3xl p-5 md:p-6 transition-all hover:border-slate-700/80">
                {/* Author Info & Tags */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={post.profiles?.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'}
                      alt="Avatar"
                      className="w-9 h-9 rounded-full object-cover border border-slate-700 bg-slate-800"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-white">{post.profiles?.display_name || 'Solar Owner'}</span>
                        {post.profiles?.role === 'installer' && (
                          <span className="bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[10px] px-2 py-0.5 rounded-full font-semibold flex items-center gap-1">
                            <ShieldCheck className="w-3 h-3"/> PRO Installer
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                        <Globe className="w-3 h-3"/> {post.profiles?.city_region}, {post.profiles?.country_code} • {post.profiles?.inverter_brand}
                      </p>
                    </div>
                  </div>

                  {getCategoryBadge(post.category)}
                </div>

                {/* Content */}
                <h2 className="text-base md:text-lg font-black text-white mb-2 leading-snug">{post.title}</h2>
                <p className="text-xs md:text-sm text-slate-300 leading-relaxed whitespace-pre-line mb-4">{post.content}</p>

                {post.image_url && (
                  <img src={post.image_url} alt="Attached image" className="rounded-2xl max-h-64 object-cover mb-4 border border-slate-800" />
                )}

                {/* Footer Interaction Bar */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-800 text-xs">
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => handleUpvote(post.id, post.upvotes_count)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 rounded-xl text-amber-400 font-bold transition-all"
                    >
                      <Flame className="w-3.5 h-3.5 fill-amber-400"/> {post.upvotes_count} Upvotes
                    </button>

                    <button
                      onClick={() => toggleComments(post.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 rounded-xl text-slate-300 font-semibold transition-all"
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-slate-400"/> Reply Thread
                      {isExpanded ? <ChevronUp className="w-3 h-3 ml-1"/> : <ChevronDown className="w-3 h-3 ml-1"/>}
                    </button>
                  </div>

                  <span className="text-[11px] text-slate-500">
                    {new Date(post.created_at).toLocaleDateString()}
                  </span>
                </div>

                {/* Inline Expandable Comments Drawer */}
                {isExpanded && (
                  <div className="mt-4 pt-4 border-t border-slate-800/80 space-y-3">
                    <div className="space-y-3">
                      {comments.map((comment) => (
                        <div key={comment.id} className="p-3.5 bg-slate-800/40 border border-slate-800 rounded-2xl text-xs space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-200 flex items-center gap-1.5">
                              {comment.profiles?.display_name}
                              {comment.profiles?.role === 'installer' && (
                                <span className="text-[10px] text-blue-400 font-semibold">(PRO)</span>
                              )}
                            </span>
                            <span className="text-[10px] text-slate-500">{new Date(comment.created_at).toLocaleDateString()}</span>
                          </div>
                          <p className="text-slate-300 leading-normal">{comment.content}</p>
                        </div>
                      ))}
                    </div>

                    {/* Add Comment Field */}
                    <div className="flex gap-2 pt-2">
                      <input
                        type="text"
                        placeholder="Write a helpful answer or question..."
                        value={newCommentText}
                        onChange={(e) => setNewCommentText(e.target.value)}
                        className="flex-1 px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                      />
                      <button
                        onClick={() => handleAddComment(post.id)}
                        disabled={submittingComment}
                        className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1 transition-all"
                      >
                        <Send className="w-3.5 h-3.5"/> Reply
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <CreateDiscussionModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSuccess={fetchPosts} />
    </div>
  );
};

export default Discussion;
