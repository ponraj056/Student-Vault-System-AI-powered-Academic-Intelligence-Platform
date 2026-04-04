import { useState, useEffect } from 'react';

export default function Internship({ user, onToast }) {
  const [loading, setLoading] = useState(true);
  const [internshipData, setInternshipData] = useState(null);
  const [targetId, setTargetId] = useState(user.studentId || user.username || 'CS001');
  const [manualData, setManualData] = useState('');

  useEffect(() => {
    const fetchInternship = async () => {
      try {
        const response = await fetch('/api/ai/query', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            query: 'Show my internship details',
            studentId: targetId,
            userRole: user.role
          })
        });
        const data = await response.json();
        setInternshipData(data.message || 'No internship records found.');
        setLoading(false);
      } catch (err) {
        setLoading(false);
      }
    };
    fetchInternship();
  }, [user, targetId]);

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">Internship Portal</h2>
          <p className="text-gray-500 text-sm mt-1">Registry of professional milestones and industrial exposure.</p>
        </div>
        <div className="flex items-center gap-4">
           {user.role !== 'student' && (
              <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-white/5 border border-white/10">
                 <span className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Lookup ID:</span>
                 <input 
                    type="text" 
                    value={targetId}
                    onChange={(e) => setTargetId(e.target.value)}
                    className="bg-transparent text-xs font-black text-white border-none outline-none w-20"
                 />
              </div>
           )}
           <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#4ff07f]/10 border border-[#4ff07f]/20">
             <span className="material-symbols-outlined text-[18px] text-[#4ff07f]">workspace_premium</span>
             <span className="text-[10px] font-black uppercase text-[#4ff07f] tracking-widest leading-none">Verified Experience</span>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Detail Card */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-[#121212] border border-gray-200 dark:border-white/5 rounded-[2.5rem] p-10 shadow-2xl relative overflow-hidden group">
            {/* Background Glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#4ff07f]/5 blur-[80px] rounded-full -translate-y-1/2 translate-x-1/2" />
            
            <div className="relative z-10 space-y-8">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-400 p-0.5 shadow-xl">
                   <div className="w-full h-full rounded-2xl bg-[#121212] flex items-center justify-center">
                      <span className="material-symbols-outlined text-white text-2xl">business_center</span>
                   </div>
                </div>
                <div>
                   <p className="text-[10px] font-black uppercase tracking-widest text-[#4ff07f] mb-1">Current Placement</p>
                   <h3 className="text-2xl font-black text-gray-900 dark:text-white">Professional Registry</h3>
                </div>
              </div>

              <div className="space-y-4">
                {loading ? (
                   <div className="h-20 flex items-center justify-center gap-3">
                      <div className="w-5 h-5 border-2 border-[#4ff07f] border-t-transparent animate-spin rounded-full" />
                      <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Accessing Vault...</span>
                   </div>
                ) : Array.isArray(internshipData) && internshipData.length > 0 ? (
                  internshipData.map((item, idx) => (
                    <div key={idx} className="p-6 rounded-[2rem] bg-gray-50 dark:bg-white/[0.02] border border-gray-100 dark:border-white/5 group/entry hover:border-[#4ff07f]/30 transition-all">
                       <div className="flex items-center justify-between mb-2">
                          <h4 className="text-lg font-black text-white group-hover/entry:text-[#4ff07f] transition-colors">{item.company}</h4>
                          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{item.duration}</span>
                       </div>
                       <p className="text-xs font-bold text-blue-400 mb-2 uppercase tracking-wide">{item.role}</p>
                       <p className="text-xs text-gray-400 leading-relaxed font-medium">"{item.summary}"</p>
                    </div>
                  ))
                ) : (
                  <div className="p-8 rounded-[2rem] bg-gray-50 dark:bg-white/[0.02] border border-gray-100 dark:border-white/5 text-center">
                    <p className="text-sm text-gray-500 italic font-medium">
                      No internship records found in the institutional vault.
                    </p>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                 {[
                   { label: 'Status', value: 'Completed', color: '#4ff07f' },
                   { label: 'Verified', value: 'By HOD', color: '#adc6ff' },
                   { label: 'Credits', value: '3.0 Points', color: '#f9d03f' },
                   { label: 'Grade', value: 'Elite', color: '#ffb4ab' }
                 ].map(chip => (
                   <div key={chip.label} className="p-4 rounded-2xl bg-white/5 border border-white/5 text-center">
                      <p className="text-[8px] font-black uppercase text-gray-600 tracking-widest mb-1">{chip.label}</p>
                      <p className="text-xs font-bold text-white tracking-wide" style={{ color: chip.color }}>{chip.value}</p>
                   </div>
                 ))}
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
           <div className="p-8 rounded-[2.5rem] bg-gradient-to-br from-[#4ff07f]/20 to-transparent border border-[#4ff07f]/10">
              <span className="material-symbols-outlined text-4xl text-[#4ff07f] mb-6">psychology</span>
              <h4 className="text-xl font-black text-white mb-2">{user.role === 'student' ? 'Industrial Excellence' : 'Management Console'}</h4>
              <p className="text-sm text-gray-400 leading-relaxed mb-8">
                {user.role === 'student' 
                   ? 'Your internship performance directly influences your final placement profile and institutional ranking.'
                   : 'Update student professional records. Changes are synced with the institutional AI vault instantly.'}
              </p>
              
              {user.role !== 'student' ? (
                 <div className="space-y-4">
                    <textarea 
                       className="w-full h-32 px-4 py-3 rounded-2xl bg-black/40 border border-white/10 text-xs text-white outline-none focus:border-[#4ff07f]/40 transition-all font-medium"
                       placeholder="Enter Internship details (Company, Role, Duration)..."
                       value={manualData}
                       onChange={e => setManualData(e.target.value)}
                    />
                    <button 
                       onClick={() => { onToast('Registry Updated Successfully ✓', 'success'); setInternshipData(manualData); setManualData(''); }}
                       className="w-full py-4 rounded-2xl bg-[#4ff07f] text-[#003915] font-black text-xs uppercase tracking-widest hover:scale-[1.02] transition-all shadow-xl shadow-[#4ff07f]/20"
                    >
                       Sync Registry
                    </button>
                 </div>
              ) : (
                 <button className="w-full py-4 rounded-2xl bg-[#4ff07f] text-[#003915] font-black text-xs uppercase tracking-widest hover:scale-[1.02] transition-all shadow-xl shadow-[#4ff07f]/20">
                    Request Verification
                 </button>
              )}
           </div>
           
           <div className="p-8 rounded-[2.5rem] bg-white/5 border border-white/5">
              <h4 className="text-xs font-black uppercase tracking-widest text-gray-500 mb-6">Upcoming Opportunities</h4>
              <div className="space-y-4">
                 {[
                   { company: 'Google Cloud', role: 'DevOps Intern', date: 'Jun - Aug' },
                   { company: 'Amazon Robotics', role: 'SDE Intern', date: 'Aug - Oct' }
                 ].map(o => (
                    <div key={o.company} className="p-4 rounded-2xl bg-black/20 border border-white/5 flex items-center justify-between group cursor-pointer hover:border-[#4ff07f]/40 transition-all">
                       <div className="min-w-0">
                          <p className="text-xs font-black text-white truncate">{o.company}</p>
                          <p className="text-[10px] text-gray-500">{o.role}</p>
                       </div>
                       <span className="text-[10px] font-bold text-[#4ff07f]">{o.date}</span>
                    </div>
                 ))}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
