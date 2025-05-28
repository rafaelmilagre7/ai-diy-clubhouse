
import { motion } from "framer-motion";

const Divider = () => {
  return (
    <motion.div
      initial={{ opacity: 0, scaleX: 0 }}
      animate={{ opacity: 1, scaleX: 1 }}
      transition={{ duration: 0.4, delay: 0.35 }}
      className="relative my-6"
    >
      <div className="absolute inset-0 flex items-center">
        <span className="w-full border-t border-white/20"></span>
      </div>
      <div className="relative flex justify-center text-xs uppercase">
        <span className="bg-black/40 backdrop-blur-sm px-4 py-1 text-white/60 font-medium rounded-full border border-white/10">
          ou continue com
        </span>
      </div>
    </motion.div>
  );
};

export default Divider;
