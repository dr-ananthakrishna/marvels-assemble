import { useNavigate } from 'react-router';
import { Sparkles, LogIn, UserPlus } from 'lucide-react';
import { motion } from 'motion/react';

export default function Welcome() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white flex flex-col lg:flex-row">
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 lg:py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full text-center lg:text-left"
        >
          <div className="inline-flex items-center gap-2 mb-6">
            <Sparkles className="w-8 h-8 text-[#62C8DF]" strokeWidth={1.5} />
            <h1 className="text-4xl font-semibold">Welcome, future Marvel</h1>
          </div>

          <p className="text-muted-foreground mb-12 text-lg">
            Join 1,500+ medical student ambassadors making an impact across India
          </p>

          <div className="flex flex-col gap-4">
            <button
              onClick={() => navigate('/login')}
              className="w-full h-12 rounded-[4px] flex items-center justify-center gap-3 relative"
            >
              <div aria-hidden className="absolute bg-[#62c8df] inset-0 pointer-events-none rounded-[4px]" />
              <LogIn className="w-5 h-5 relative z-10 text-white" strokeWidth={2} />
              <span className="relative z-10 font-bold text-sm text-white tracking-[0.5px]">
                LOGIN WITH MARROW
              </span>
              <div className="absolute inset-0 pointer-events-none rounded-[inherit] shadow-[inset_0px_-2px_3px_0px_rgba(0,0,0,0.2)]" />
            </button>

            <button
              onClick={() => navigate('/register')}
              className="w-full py-4 px-6 rounded-[4px] flex items-center justify-center gap-3 font-medium text-sm text-[#4a69a2] hover:bg-secondary transition-colors"
            >
              <UserPlus className="w-5 h-5" strokeWidth={2} />
              Register as New Marvel
            </button>
          </div>
        </motion.div>
      </div>

      <div className="hidden lg:flex flex-1 bg-white items-center justify-center p-20 border-l border-border">
        <div className="max-w-lg">
          <div className="grid grid-cols-2 gap-6">
            {[
              { label: 'Active Marvels', value: '1,500+' },
              { label: 'Total Impact', value: '50K+' },
              { label: 'Master Classes', value: '5' },
              { label: 'Amazing Rewards', value: '∞' },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1 }}
                className="bg-white p-6 rounded-2xl shadow-sm border border-border"
              >
                <div className="text-3xl font-semibold text-[#62C8DF] mb-2">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
