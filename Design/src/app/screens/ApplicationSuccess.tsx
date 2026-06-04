import { useNavigate } from 'react-router';
import { CheckCircle2, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';

export default function ApplicationSuccess() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring' }}
          className="w-24 h-24 bg-[#62C8DF]/10 rounded-full flex items-center justify-center mx-auto mb-6"
        >
          <CheckCircle2 className="w-12 h-12 text-[#62C8DF]" strokeWidth={2} />
        </motion.div>

        <h1 className="text-3xl font-semibold mb-3">Application submitted!</h1>
        <p className="text-muted-foreground mb-8 text-lg">
          We'll review your profile and get back to you soon. Meanwhile, explore what being a Marvel looks like.
        </p>

        <button
          onClick={() => navigate('/dashboard')}
          className="h-12 px-8 rounded-[4px] relative inline-flex items-center gap-2"
        >
          <div aria-hidden className="absolute bg-[#62c8df] inset-0 pointer-events-none rounded-[4px]" />
          <span className="relative z-10 font-bold text-sm text-white tracking-[0.5px]">
            EXPLORE THE PLATFORM
          </span>
          <ArrowRight className="w-5 h-5 relative z-10 text-white" strokeWidth={2} />
          <div className="absolute inset-0 pointer-events-none rounded-[inherit] shadow-[inset_0px_-2px_3px_0px_rgba(0,0,0,0.2)]" />
        </button>
      </motion.div>
    </div>
  );
}
