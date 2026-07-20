import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

type Role = 'student' | 'faculty' | 'institute';

const roleLabels: Record<Role, string> = {
  student: 'Student',
  faculty: 'Faculty',
  institute: 'Institute',
};

function RegisterPage() {
  const navigate = useNavigate();
  const [role, setRole] = useState<Role>('student');
  const [step, setStep] = useState(1);

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-6 py-12">
      <div className="liquid-glass rounded-3xl p-8 w-full max-w-2xl">
        <div className="rounded-full bg-white/5 p-1 flex mb-6">
          {(Object.keys(roleLabels) as Role[]).map((entry) => (
            <button
              key={entry}
              type="button"
              className={`flex-1 text-center text-sm py-2.5 rounded-full transition-all duration-300 ${role === entry ? 'bg-white text-black font-medium' : 'text-white/60'}`}
              onClick={() => setRole(entry)}
            >
              {roleLabels[entry]}
            </button>
          ))}
        </div>
        <h2 className="text-3xl font-semibold mb-4">Create your SmartEd account</h2>
        <p className="text-white/70 mb-6">Choose your role and complete the guided onboarding flow.</p>
        {step === 1 ? (
          <div className="space-y-4">
            <input className="w-full rounded-full bg-white/10 px-4 py-3 placeholder:text-white/40" placeholder="Full name" />
            <input className="w-full rounded-full bg-white/10 px-4 py-3 placeholder:text-white/40" placeholder="Email" />
            <input className="w-full rounded-full bg-white/10 px-4 py-3 placeholder:text-white/40" placeholder="Password" />
            {role === 'student' ? <input className="w-full rounded-full bg-white/10 px-4 py-3 placeholder:text-white/40" placeholder="Date of birth" /> : null}
            {role === 'faculty' ? <input className="w-full rounded-full bg-white/10 px-4 py-3 placeholder:text-white/40" placeholder="Institute affiliation request" /> : null}
            {role === 'institute' ? <input className="w-full rounded-full bg-white/10 px-4 py-3 placeholder:text-white/40" placeholder="Institute name" /> : null}
            <button onClick={() => setStep(2)} className="bg-white text-black rounded-full px-6 py-2.5 font-medium w-full">
              Continue
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-white/80">Your signup is queued for approval and will appear in the appropriate portal once submitted.</p>
            <button onClick={() => navigate('/')} className="bg-white text-black rounded-full px-6 py-2.5 font-medium">
              Back to login
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default RegisterPage;
