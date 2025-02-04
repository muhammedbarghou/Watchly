import { motion } from 'framer-motion';

function Loader() {
  return (
    <div className="h-screen flex justify-center items-center bg-black">
      <div className="w-full gap-x-2 flex justify-center items-center">
        {['#d00000', '#dc2f02', '#e85d04'].map((color, index) => (
          <motion.div
            key={color}
            className={`w-5 h-5 rounded-full`}
            style={{ backgroundColor: color }}
            animate={{
              y: [0, -30, 0],
            }}
            transition={{
              duration: 0.5,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: index * 0.2,
            }}
          />
        ))}
      </div>
    </div>
  );
}

export default Loader;