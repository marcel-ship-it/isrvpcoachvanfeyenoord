import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { supabase } from './supabaseClient';

const RVPStatusSite = () => {
  const [isCoach, setIsCoach] = useState(true);
  const [showAdmin, setShowAdmin] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [vote, setVote] = useState(null);
  const [canVote, setCanVote] = useState(true);
  const [timeUntilNextVote, setTimeUntilNextVote] = useState(null);
  const [pollResults, setPollResults] = useState({ in: 0, out: 0 });
  const [trendData, setTrendData] = useState([]);
  const [trendPeriod, setTrendPeriod] = useState('week');
  const [newsItems, setNewsItems] = useState([]);
  const [newsLoading, setNewsLoading] = useState(true);

  // Load news from API
  const loadNews = async () => {
    try {
      const response = await fetch('/api/news');
      const data = await response.json();
      
      if (data.success && data.items) {
        setNewsItems(data.items);
      }
    } catch (error) {
      console.error('Error loading news:', error);
      // Fallback to some default items if API fails
      setNewsItems([
        {
          source: 'LOADING',
          headline: 'Nieuws wordt geladen...',
          time: '',
          url: '#'
        }
      ]);
    } finally {
      setNewsLoading(false);
    }
  };

  // Load poll results from database
  const loadPollResults = async () => {
    try {
      const { data, error } = await supabase
        .from('poll_votes')
        .select('vote_type');
      
      if (error) throw error;
      
      const counts = { in: 0, out: 0 };
      data.forEach(vote => {
        counts[vote.vote_type]++;
      });
      
      setPollResults(counts);
    } catch (error) {
      console.error('Error loading poll results:', error);
    }
  };

  // Load historical trend data
  const loadTrendData = async () => {
    try {
      const daysToLoad = trendPeriod === 'week' ? 7 : 30;
      
      const { data, error} = await supabase
        .from('poll_votes')
        .select('created_at, vote_type')
        .gte('created_at', new Date(Date.now() - daysToLoad * 24 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: true });
      
      if (error) throw error;

      // Group by day
      const dailyData = {};
      data.forEach(vote => {
        const date = new Date(vote.created_at).toLocaleDateString('nl-NL', { 
          day: 'numeric', 
          month: 'short' 
        });
        
        if (!dailyData[date]) {
          dailyData[date] = { date, in: 0, out: 0, total: 0 };
        }
        
        dailyData[date][vote.vote_type]++;
        dailyData[date].total++;
      });

      // Fill in missing days
      const filledData = [];
      for (let i = daysToLoad - 1; i >= 0; i--) {
        const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
        const dateStr = date.toLocaleDateString('nl-NL', { 
          day: 'numeric', 
          month: 'short' 
        });
        
        filledData.push(dailyData[dateStr] || { date: dateStr, in: 0, out: 0, total: 0 });
      }

      setTrendData(filledData);
    } catch (error) {
      console.error('Error loading trend data:', error);
    }
  };

  // Check vote eligibility
  const checkVoteEligibility = () => {
    const lastVoteTime = localStorage.getItem('rvp-last-vote-time');
    const lastVoteChoice = localStorage.getItem('rvp-last-vote-choice');
    
    if (lastVoteTime) {
      const timeSinceVote = Date.now() - parseInt(lastVoteTime);
      const twentyFourHours = 24 * 60 * 60 * 1000;
      
      if (timeSinceVote < twentyFourHours) {
        setCanVote(false);
        setVote(lastVoteChoice);
        setTimeUntilNextVote(twentyFourHours - timeSinceVote);
      } else {
        setCanVote(true);
        setVote(null);
        setTimeUntilNextVote(null);
      }
    }
  };

  // Handle vote
  const handleVote = async (choice) => {
    if (!canVote) return;
    
    try {
      const { error } = await supabase
        .from('poll_votes')
        .insert([{ vote_type: choice }]);
      
      if (error) throw error;
      
      localStorage.setItem('rvp-last-vote-time', Date.now().toString());
      localStorage.setItem('rvp-last-vote-choice', choice);
      
      setVote(choice);
      setCanVote(false);
      setTimeUntilNextVote(24 * 60 * 60 * 1000);
      
      await loadPollResults();
      await loadTrendData();
    } catch (error) {
      console.error('Error submitting vote:', error);
      alert('Er ging iets mis. Probeer het opnieuw.');
    }
  };

  // Countdown timer
  useEffect(() => {
    if (!canVote && timeUntilNextVote) {
      const interval = setInterval(() => {
        const newTimeLeft = timeUntilNextVote - 1000;
        
        if (newTimeLeft <= 0) {
          setCanVote(true);
          setVote(null);
          setTimeUntilNextVote(null);
          clearInterval(interval);
        } else {
          setTimeUntilNextVote(newTimeLeft);
        }
      }, 1000);
      
      return () => clearInterval(interval);
    }
  }, [canVote, timeUntilNextVote]);

  // Initial load
  useEffect(() => {
    checkVoteEligibility();
    loadPollResults();
    loadTrendData();
    loadNews();
  }, []);

  // Reload on period change
  useEffect(() => {
    loadTrendData();
  }, [trendPeriod]);

  // Refresh news every 5 minutes
  useEffect(() => {
    const newsInterval = setInterval(() => {
      loadNews();
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(newsInterval);
  }, []);

  const formatTimeRemaining = (ms) => {
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}u ${minutes}m`;
  };

  const handleAdminToggle = () => {
    if (adminPassword === 'rvp2026') {
      setIsCoach(!isCoach);
      setShowAdmin(false);
      setAdminPassword('');
    } else {
      alert('Onjuist wachtwoord');
    }
  };

  const totalVotes = pollResults.in + pollResults.out;
  const outPercentage = totalVotes > 0 ? Math.round((pollResults.out / totalVotes) * 100) : 0;
  const inPercentage = totalVotes > 0 ? 100 - outPercentage : 0;

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{
          background: '#fff',
          padding: '12px',
          border: '1px solid #e0e0e0',
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <p style={{ margin: '0 0 8px 0', fontWeight: '600' }}>{payload[0].payload.date}</p>
          <p style={{ margin: '4px 0', color: '#2e7d32' }}>IN: {payload[0].payload.in}</p>
          <p style={{ margin: '4px 0', color: '#c62828' }}>OUT: {payload[0].payload.out}</p>
          <p style={{ margin: '8px 0 0 0', fontWeight: '600', borderTop: '1px solid #e0e0e0', paddingTop: '8px' }}>
            Totaal: {payload[0].payload.total}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div style={{ 
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      minHeight: '100vh',
      background: '#f5f5f5'
    }}>
      <header style={{
        background: '#fff',
        padding: '1.25rem 1.5rem',
        borderBottom: '1px solid #e0e0e0',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#2e7d32' }} />
            <h1 style={{ color: '#000', margin: 0, fontSize: '1.1rem', fontWeight: '600' }}>isrvpnogcoachvanfeyenoord.nl</h1>
          </div>
          <button 
            onClick={() => setShowAdmin(true)}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#666',
              cursor: 'pointer',
              fontSize: '0.9rem'
            }}
          >
            admin
          </button>
        </div>
      </header>

      {showAdmin && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: '#fff',
            padding: '2rem',
            borderRadius: '12px',
            maxWidth: '400px',
            width: '90%',
            boxShadow: '0 10px 40px rgba(0,0,0,0.2)'
          }}>
            <h3 style={{ marginTop: 0, marginBottom: '1.5rem' }}>Admin Toggle</h3>
            <input
              type="password"
              placeholder="Wachtwoord"
              value={adminPassword}
              onChange={(e) => setAdminPassword(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAdminToggle()}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #e0e0e0',
                borderRadius: '8px',
                fontSize: '1rem',
                marginBottom: '1rem'
              }}
            />
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                onClick={handleAdminToggle}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  background: '#000',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '1rem'
                }}
              >
                Toggle
              </button>
              <button
                onClick={() => {
                  setShowAdmin(false);
                  setAdminPassword('');
                }}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  background: '#f5f5f5',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '1rem'
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <div style={{
            width: '200px',
            height: '200px',
            borderRadius: '50%',
            background: isCoach ? '#2e7d32' : '#c62828',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.5rem',
            boxShadow: '0 4px 16px rgba(0,0,0,0.1)'
          }}>
            <span style={{ 
              color: '#fff', 
              fontSize: '4rem', 
              fontWeight: '700'
            }}>
              {isCoach ? 'JA' : 'NEE'}
            </span>
          </div>
          <p style={{ color: '#666', fontSize: '0.95rem' }}>
            Laatste update: {new Date().toLocaleDateString('nl-NL', { 
              day: 'numeric',
              month: 'long',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </p>
        </div>

        <div style={{
          background: '#fff',
          borderRadius: '16px',
          padding: '2rem',
          marginBottom: '2rem',
          boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
        }}>
          <h2 style={{ 
            fontSize: '1.5rem', 
            fontWeight: '700', 
            marginTop: 0,
            marginBottom: '0.5rem',
            textAlign: 'center'
          }}>
            Robin van Persie: In of Out?
          </h2>
          <p style={{
            textAlign: 'center',
            color: '#666',
            fontSize: '0.9rem',
            marginBottom: '2rem'
          }}>
            Al {totalVotes} {totalVotes === 1 ? 'stem' : 'stemmen'}
          </p>

          {!canVote && vote && (
            <div style={{
              background: '#f5f5f5',
              padding: '1rem',
              borderRadius: '8px',
              marginBottom: '1.5rem',
              textAlign: 'center'
            }}>
              <p style={{ margin: '0 0 0.5rem 0', color: '#666' }}>
                ✓ Je hebt gestemd voor: <strong style={{ color: vote === 'in' ? '#2e7d32' : '#c62828' }}>
                  {vote === 'in' ? 'IN' : 'OUT'}
                </strong>
              </p>
              <p style={{ margin: 0, fontSize: '0.9rem', color: '#999' }}>
                Je kan over {formatTimeRemaining(timeUntilNextVote)} opnieuw stemmen
              </p>
            </div>
          )}

          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: '1fr 1fr', 
            gap: '1rem',
            marginBottom: '2rem'
          }}>
            <button
              onClick={() => handleVote('in')}
              disabled={!canVote}
              style={{
                padding: '3rem 1rem',
                background: canVote ? '#fff' : '#f5f5f5',
                border: `2px solid ${canVote ? '#2e7d32' : '#e0e0e0'}`,
                borderRadius: '12px',
                cursor: canVote ? 'pointer' : 'not-allowed',
                opacity: canVote ? 1 : 0.6
              }}
            >
              <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>👍</div>
              <div style={{ fontSize: '1.25rem', fontWeight: '700', color: '#2e7d32' }}>IN</div>
            </button>

            <button
              onClick={() => handleVote('out')}
              disabled={!canVote}
              style={{
                padding: '3rem 1rem',
                background: canVote ? '#fff' : '#f5f5f5',
                border: `2px solid ${canVote ? '#c62828' : '#e0e0e0'}`,
                borderRadius: '12px',
                cursor: canVote ? 'pointer' : 'not-allowed',
                opacity: canVote ? 1 : 0.6
              }}
            >
              <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>👎</div>
              <div style={{ fontSize: '1.25rem', fontWeight: '700', color: '#c62828' }}>OUT</div>
            </button>
          </div>

          <div>
            <div style={{
              display: 'flex',
              height: '40px',
              borderRadius: '20px',
              overflow: 'hidden',
              background: '#f5f5f5'
            }}>
              <div style={{
                width: `${inPercentage}%`,
                background: '#2e7d32',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontWeight: '600',
                fontSize: '0.9rem'
              }}>
                {inPercentage}% IN
              </div>
              <div style={{
                width: `${outPercentage}%`,
                background: '#c62828',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontWeight: '600',
                fontSize: '0.9rem'
              }}>
                {outPercentage}% OUT
              </div>
            </div>
          </div>
        </div>

        <div style={{
          background: '#fff',
          borderRadius: '16px',
          padding: '2rem',
          marginBottom: '2rem',
          boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
        }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            marginBottom: '1.5rem'
          }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '700', margin: 0 }}>
              Sentiment Trend ({trendPeriod === 'week' ? '7 Dagen' : '30 Dagen'})
            </h3>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                onClick={() => setTrendPeriod('week')}
                style={{
                  padding: '0.5rem 1rem',
                  background: trendPeriod === 'week' ? '#000' : '#f5f5f5',
                  color: trendPeriod === 'week' ? '#fff' : '#666',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '0.9rem'
                }}
              >
                Week
              </button>
              <button
                onClick={() => setTrendPeriod('month')}
                style={{
                  padding: '0.5rem 1rem',
                  background: trendPeriod === 'month' ? '#000' : '#f5f5f5',
                  color: trendPeriod === 'month' ? '#fff' : '#666',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '0.9rem'
                }}
              >
                Maand
              </button>
            </div>
          </div>
          
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={trendData} margin={{ top: 20, right: 20, left: 0, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="date" 
                tick={{ fill: '#666', fontSize: 12 }}
                axisLine={{ stroke: '#e0e0e0' }}
              />
              <YAxis 
                tick={{ fill: '#666', fontSize: 12 }}
                axisLine={{ stroke: '#e0e0e0' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend iconType="square" />
              <Bar dataKey="in" fill="#2e7d32" radius={[8, 8, 0, 0]} name="IN" />
              <Bar dataKey="out" fill="#c62828" radius={[8, 8, 0, 0]} name="OUT" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div style={{
          background: '#fff',
          borderRadius: '16px',
          padding: '2rem',
          boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
        }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginTop: 0, marginBottom: '1.5rem' }}>
            Laatste Nieuws
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {newsItems.map((item, index) => (
              
                key={index}
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'block',
                  padding: '1rem',
                  background: '#f8f8f8',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  transition: 'background 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#f0f0f0'}
                onMouseLeave={(e) => e.currentTarget.style.background = '#f8f8f8'}
              >
                <div style={{ fontSize: '0.75rem', color: '#999', fontWeight: '600', marginBottom: '0.5rem' }}>
                  {item.source}
                </div>
                <div style={{ fontSize: '1rem', color: '#000', fontWeight: '500', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span>{item.headline}</span>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginLeft: 'auto' }}>
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                    <polyline points="15 3 21 3 21 9"></polyline>
                    <line x1="10" y1="14" x2="21" y2="3"></line>
                  </svg>
                </div>
                <div style={{ fontSize: '0.85rem', color: '#666' }}>
                  {item.time}
                </div>
              </a>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default RVPStatusSite;
