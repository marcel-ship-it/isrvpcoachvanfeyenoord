import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { supabase } from './supabaseClient';

const RVPStatusSite = () => {
  const [isCoach, setIsCoach] = useState(true);
  const [showAdmin, setShowAdmin] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [vote, setVote] = useState(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [pollResults, setPollResults] = useState({ in: 4501, out: 6369 });
  const [trendData] = useState([
    { date: 'Ma', out: 14 },
    { date: 'Di', out: 20 },
    { date: 'Wo', out: 19 },
    { date: 'Do', out: 21 },
    { date: 'Vr', out: 21 },
    { date: 'Za', out: 22 },
    { date: 'Zo', out: 22 }
  ]);

  const [newsItems] = useState([
    {
      source: 'VOETBAL INTERNATIONAL',
      headline: 'Van Persie ziet verbetering ondanks gelijkspel',
      time: '2 uur geleden',
      url: '#'
    },
    {
      source: 'AD SPORTWERELD',
      headline: 'Analyse: Waarom het middenveld nog niet staat bij Feyenoord',
      time: '4 uur geleden',
      url: '#'
    },
    {
      source: '1908.NL',
      headline: 'Supporters steunen Van Persie massaal tijdens training',
      time: '6 uur geleden',
      url: '#'
    },
    {
      source: 'ESPN.NL',
      headline: 'Feyenoord strikt nieuwe assistent op voorspraak van hoofdtrainer',
      time: 'Gisteren',
      url: '#'
    },
    {
      source: 'VOETBAL INTERNATIONAL',
      headline: 'Column: Geef Robin de tijd, Rome is niet in één dag gebouwd',
      time: 'Gisteren',
      url: '#'
    }
  ]);

  useEffect(() => {
    const voted = localStorage.getItem('rvp-voted');
    if (voted) {
      setHasVoted(true);
      setVote(voted);
    }
    // Load poll results from Supabase
    loadPollResults();
  }, []);

  const loadPollResults = async () => {
    try {
      const { data, error } = await supabase
        .from('poll_votes')
        .select('vote_type');
      
      if (error) throw error;
      
      // Count votes
      const counts = { in: 0, out: 0 };
      data.forEach(vote => {
        if (vote.vote_type === 'in' || vote.vote_type === 'out') {
          counts[vote.vote_type]++;
        }
      });
      
      setPollResults(counts);
    } catch (error) {
      console.error('Error loading poll results:', error);
    }
  };

  const handleVote = async (choice) => {
    if (!hasVoted) {
      try {
        // Insert vote into Supabase
        const { error } = await supabase
          .from('poll_votes')
          .insert([{ vote_type: choice }]);
        
        if (error) throw error;
        
        // Update local state
        setVote(choice);
        setHasVoted(true);
        localStorage.setItem('rvp-voted', choice);
        
        // Reload poll results
        await loadPollResults();
      } catch (error) {
        console.error('Error voting:', error);
      }
    }
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
  const outPercentage = Math.round((pollResults.out / totalVotes) * 100);
  const inPercentage = 100 - outPercentage;

  return (
    <div style={{ 
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      minHeight: '100vh',
      background: '#f5f5f5'
    }}>
      {/* Header */}
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
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#e30613' }} />
            <h1 style={{ color: '#000', margin: 0, fontSize: '1.1rem', fontWeight: '600' }}>isrvpcoach.nl</h1>
          </div>
          <button 
            onClick={() => setShowAdmin(true)}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#666',
              cursor: 'pointer',
              fontSize: '0.9rem',
              fontWeight: '400'
            }}
          >
            admin
          </button>
        </div>
      </header>

      {/* Admin Modal */}
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
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #e0e0e0',
                borderRadius: '8px',
                marginBottom: '1rem',
                boxSizing: 'border-box',
                fontSize: '1rem'
              }}
            />
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button
                onClick={handleAdminToggle}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  background: '#e30613',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '1rem'
                }}
              >
                Toggle Status
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
                  color: '#333',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '1rem'
                }}
              >
                Annuleren
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hero Status */}
      <section style={{
        padding: '4rem 1.5rem 3rem',
        textAlign: 'center',
        maxWidth: '800px',
        margin: '0 auto'
      }}>
        <h2 style={{
          color: '#000',
          fontSize: '1.75rem',
          marginBottom: '3rem',
          lineHeight: '1.4',
          fontWeight: '600'
        }}>
          Is Robin van Persie nog trainer van Feyenoord?
        </h2>
        
        <div style={{
          width: '200px',
          height: '200px',
          margin: '0 auto',
          background: isCoach ? '#2d7a4f' : '#c41e3a',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
        }}>
          <span style={{
            color: '#fff',
            fontSize: '4rem',
            fontWeight: 'bold',
            textTransform: 'uppercase'
          }}>
            {isCoach ? 'JA' : 'NEE'}
          </span>
        </div>

        <p style={{ color: '#666', marginTop: '2rem', fontSize: '0.9rem' }}>
          Laatste update: 17 januari 2026 15:23
        </p>
      </section>

      {/* Poll Section */}
      <section style={{
        padding: '2rem 1.5rem',
        maxWidth: '800px',
        margin: '0 auto'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h3 style={{ color: '#000', fontSize: '1.5rem', marginBottom: '0.5rem', fontWeight: '600' }}>
            Robin van Persie: In of Out?
          </h3>
          <p style={{ color: '#666', fontSize: '0.95rem' }}>
            Al {totalVotes.toLocaleString('nl-NL')} stemmen
          </p>
        </div>

        {!hasVoted ? (
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '1rem', 
            marginBottom: '3rem' 
          }}>
            <button
              onClick={() => handleVote('in')}
              style={{
                padding: '2rem 1.5rem',
                background: '#fff',
                color: '#000',
                border: '2px solid #e0e0e0',
                borderRadius: '12px',
                fontSize: '1rem',
                cursor: 'pointer',
                transition: 'all 0.2s',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '1rem',
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.borderColor = '#2d7a4f';
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.12)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.borderColor = '#e0e0e0';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)';
              }}
            >
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#2d7a4f" strokeWidth="2">
                <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path>
              </svg>
              <div style={{ fontSize: '1.25rem', fontWeight: '700' }}>IN</div>
            </button>
            <button
              onClick={() => handleVote('out')}
              style={{
                padding: '2rem 1.5rem',
                background: '#fff',
                color: '#000',
                border: '2px solid #e0e0e0',
                borderRadius: '12px',
                fontSize: '1rem',
                cursor: 'pointer',
                transition: 'all 0.2s',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '1rem',
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.borderColor = '#e30613';
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.12)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.borderColor = '#e0e0e0';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)';
              }}
            >
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#e30613" strokeWidth="2" style={{ transform: 'rotate(180deg)' }}>
                <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path>
              </svg>
              <div style={{ fontSize: '1.25rem', fontWeight: '700' }}>OUT</div>
            </button>
          </div>
        ) : (
          <div style={{ 
            textAlign: 'center', 
            padding: '2rem',
            background: '#fff',
            borderRadius: '12px',
            marginBottom: '3rem',
            border: '1px solid #e0e0e0'
          }}>
            <p style={{ color: '#666', marginBottom: '0.5rem' }}>
              Je hebt gestemd voor:
            </p>
            <p style={{ 
              fontSize: '1.5rem', 
              fontWeight: 'bold',
              color: vote === 'out' ? '#e30613' : '#2d7a4f',
              margin: 0
            }}>
              {vote === 'out' ? 'OUT' : 'IN'}
            </p>
          </div>
        )}

        {/* Trend Chart */}
        <div style={{
          background: '#fff',
          padding: '2rem',
          borderRadius: '12px',
          border: '1px solid #e0e0e0',
          marginBottom: '2rem'
        }}>
          <h4 style={{ 
            color: '#000', 
            marginBottom: '0.5rem',
            fontSize: '1.25rem',
            fontWeight: '600'
          }}>
            Sentiment Trend (7 Dagen)
          </h4>
          <p style={{ 
            color: '#666', 
            fontSize: '0.9rem', 
            marginBottom: '2rem' 
          }}>
            Percentage stemmen voor "OUT"
          </p>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis 
                dataKey="date" 
                stroke="#666"
                style={{ fontSize: '0.875rem' }}
              />
              <YAxis 
                stroke="#666"
                domain={[0, 28]}
                ticks={[0, 7, 14, 21, 28]}
                style={{ fontSize: '0.875rem' }}
                label={{ 
                  value: '0%', 
                  position: 'insideLeft', 
                  offset: -5,
                  style: { fontSize: '0.75rem', fill: '#666' }
                }}
              />
              <Tooltip 
                contentStyle={{ 
                  background: '#fff', 
                  border: '1px solid #e0e0e0', 
                  borderRadius: '8px',
                  fontSize: '0.875rem'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="out" 
                stroke="#e30613" 
                strokeWidth={2}
                dot={{ fill: '#e30613', r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
          <p style={{ 
            color: '#999', 
            fontSize: '0.85rem', 
            marginTop: '1rem',
            textAlign: 'center'
          }}>
            Trend toont het percentage supporters dat "OUT" steunt over de afgelopen week.
          </p>
        </div>
      </section>

      {/* News Feed */}
      <section style={{
        padding: '2rem 1.5rem 4rem',
        maxWidth: '800px',
        margin: '0 auto'
      }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '1.5rem' 
        }}>
          <h3 style={{ 
            color: '#000', 
            fontSize: '1.5rem',
            fontWeight: '600',
            margin: 0
          }}>
            Laatste Nieuws & Geruchten
          </h3>
          <span style={{ 
            color: '#999', 
            fontSize: '0.85rem' 
          }}>
            Update: 1m geleden
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {newsItems.map((item, index) => (
            <a
              key={index}
              href={item.url}
              style={{
                background: '#fff',
                padding: '1.25rem',
                borderRadius: '8px',
                textDecoration: 'none',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                gap: '1rem',
                border: '1px solid #e0e0e0',
                transition: 'all 0.2s'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.borderColor = '#ccc';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.borderColor = '#e0e0e0';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div style={{ flex: 1 }}>
                <div style={{ 
                  color: '#e30613', 
                  fontSize: '0.75rem', 
                  fontWeight: '700',
                  letterSpacing: '0.5px',
                  marginBottom: '0.5rem'
                }}>
                  {item.source}
                </div>
                <h4 style={{ 
                  color: '#000', 
                  margin: '0 0 0.5rem 0', 
                  fontSize: '1rem', 
                  lineHeight: '1.5',
                  fontWeight: '500'
                }}>
                  {item.headline}
                </h4>
                <div style={{ 
                  color: '#999', 
                  fontSize: '0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem'
                }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <polyline points="12 6 12 12 16 14"></polyline>
                  </svg>
                  {item.time}
                </div>
              </div>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="2" style={{ flexShrink: 0 }}>
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                <polyline points="15 3 21 3 21 9"></polyline>
                <line x1="10" y1="14" x2="21" y2="3"></line>
              </svg>
            </a>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        background: '#fff',
        padding: '2rem 1.5rem',
        borderTop: '1px solid #e0e0e0',
        textAlign: 'center',
        color: '#666',
        fontSize: '0.85rem'
      }}>
        <p style={{ margin: '0 0 0.5rem 0' }}>isrvpcoach.nl - Een onafhankelijke status tracker</p>
        <p style={{ margin: 0, color: '#999' }}>
          Geen officiële bron. Voor officieel nieuws, check <a href="https://www.feyenoord.nl" style={{ color: '#e30613', textDecoration: 'none' }}>Feyenoord.nl</a>
        </p>
      </footer>
    </div>
  );
};

export default RVPStatusSite;
