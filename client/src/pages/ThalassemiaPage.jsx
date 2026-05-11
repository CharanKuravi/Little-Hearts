import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Calendar, MapPin, AlertCircle, Users } from 'lucide-react';
import api from '../api/axios';
import Card from '../components/ui/Card';
import BloodTypeBadge from '../components/ui/BloodTypeBadge';
import Button from '../components/ui/Button';

export default function ThalassemiaPage() {
  const navigate = useNavigate();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    setLoading(true);
    try {
      const res = await api.get('/users/thalassemia');
      setPatients(res.data.patients || []);
    } catch (err) {
      console.error('Failed to fetch patients:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '32px 24px' }}>
      {/* Header */}
      <div style={{ marginBottom: '28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
          <div style={{ width: '40px', height: '40px', background: 'rgba(175,82,222,0.1)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Heart size={20} color="var(--purple)" fill="var(--purple)" />
          </div>
          <h1 style={{ fontSize: '30px', fontWeight: 800, color: 'var(--label)', letterSpacing: '-0.035em' }}>
            Thalassemia Patients
          </h1>
        </div>
        <p style={{ color: 'var(--label-3)', fontSize: '15px', maxWidth: '600px' }}>
          Patients registered with recurring transfusion needs. Each patient requires compatible blood every 2–4 weeks.
        </p>
      </div>

      {/* Info banner */}
      <div style={{ background: 'rgba(175,82,222,0.07)', border: '1px solid rgba(175,82,222,0.2)', borderRadius: '14px', padding: '16px 20px', marginBottom: '24px', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
        <AlertCircle size={18} color="var(--purple)" style={{ flexShrink: 0, marginTop: '1px' }} />
        <p style={{ fontSize: '13px', color: 'var(--label-2)', lineHeight: 1.6 }}>
          Thalassemia patients require regular blood transfusions to survive. If you are a compatible donor, consider connecting with patients who have upcoming transfusion dates. Your donation can be life-saving.
        </p>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '80px 24px' }}>
          <div style={{ width: '72px', height: '72px', background: 'rgba(175,82,222,0.08)', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', animation: 'pulse 1.5s ease-in-out infinite' }}>
            <Heart size={32} color="var(--purple)" />
          </div>
          <p style={{ color: 'var(--label-3)', fontSize: '14px' }}>Loading patients...</p>
        </div>
      ) : patients.length === 0 ? (
        <Card padding="48px" style={{ textAlign: 'center' }}>
          <div style={{ width: '64px', height: '64px', background: 'rgba(175,82,222,0.08)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <Users size={28} color="var(--purple)" />
          </div>
          <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--label)', marginBottom: '8px' }}>No patients registered yet</h3>
          <p style={{ color: 'var(--label-3)', fontSize: '14px' }}>Thalassemia patients can register and set their transfusion schedule</p>
        </Card>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '14px' }}>
          {patients.map(patient => (
            <PatientCard key={patient._id} patient={patient} onFindDonors={() => navigate(`/donors?bloodType=${patient.transfusionSchedule?.requiredBloodType || patient.bloodType}`)} />
          ))}
        </div>
      )}
    </div>
  );
}

function PatientCard({ patient, onFindDonors }) {
  const schedule = patient.transfusionSchedule;
  const days = patient.daysUntilTransfusion;
  const isUrgent = days !== undefined && days <= 7;
  const bloodType = schedule?.requiredBloodType || patient.bloodType;

  return (
    <Card hover padding="20px">
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '14px' }}>
        <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(175,82,222,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Heart size={20} color="var(--purple)" fill="var(--purple)" />
        </div>
        <div style={{ flex: 1 }}>
          <p style={{ fontWeight: 700, fontSize: '15px', color: 'var(--label)', marginBottom: '5px' }}>{patient.name}</p>
          <BloodTypeBadge type={bloodType} size="sm" />
        </div>
      </div>

      {patient.city && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--label-3)', marginBottom: '8px' }}>
          <MapPin size={12} color="var(--label-4)" /> {patient.city}
        </div>
      )}

      {schedule?.nextTransfusionDate && (
        <div style={{ padding: '12px', background: isUrgent ? 'rgba(255,59,48,0.07)' : 'rgba(118,118,128,0.06)', borderRadius: '11px', marginBottom: '14px', border: isUrgent ? '1px solid rgba(255,59,48,0.2)' : '1px solid transparent' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '7px', marginBottom: '4px' }}>
            <Calendar size={13} color={isUrgent ? 'var(--red)' : 'var(--label-4)'} />
            <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--label-4)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Next Transfusion</span>
          </div>
          <p style={{ fontSize: '14px', fontWeight: 700, color: isUrgent ? 'var(--red)' : 'var(--label)' }}>
            {days === 0 ? 'Today' : days === 1 ? 'Tomorrow' : `In ${days} days`}
          </p>
          <p style={{ fontSize: '12px', color: 'var(--label-4)', marginTop: '2px' }}>
            {new Date(schedule.nextTransfusionDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
          </p>
        </div>
      )}

      {schedule?.frequencyWeeks && (
        <p style={{ fontSize: '12px', color: 'var(--label-4)', marginBottom: '14px' }}>
          Every {schedule.frequencyWeeks} weeks
        </p>
      )}

      <button onClick={onFindDonors} style={{
        width: '100%', padding: '10px', background: 'linear-gradient(180deg,#BF5AF2,#AF52DE)',
        color: '#fff', border: 'none', borderRadius: '11px', cursor: 'pointer',
        fontSize: '13px', fontWeight: 600, fontFamily: 'inherit',
        boxShadow: '0 3px 10px rgba(175,82,222,0.3)', transition: 'all .18s',
      }}
        onMouseEnter={e => { e.currentTarget.style.filter = 'brightness(1.06)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
        onMouseLeave={e => { e.currentTarget.style.filter = 'none'; e.currentTarget.style.transform = 'translateY(0)'; }}
      >
        Find Compatible Donors
      </button>
    </Card>
  );
}
