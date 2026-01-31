import React from 'react';
import { X, Sparkles } from 'lucide-react';
import { cn } from '@/utils/cn';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (

    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">

      {/* Backdrop */}
      <div
        className="absolute inset-0 backdrop-blur-lg"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="
        relative z-50 w-full max-w-lg max-h-[90vh]
        flex flex-col overflow-hidden rounded-xl
        bg-white dark:bg-slate-900
        border border-slate-200 dark:border-slate-700
        shadow-xl dark:shadow-2xl dark:shadow-black/40
        animate-in fade-in zoom-in-95 duration-200
      ">

        {/* Header */}
        <div className="relative flex items-center justify-between p-6 border-b  dark:border-slate-700">
          <div className="absolute top-0 left-0 right-0 h-1  dark:bg-blue-500" />

          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg dark:bg-blue-950/40 flex items-center justify-center">
              <Sparkles className="h-5 w-5  dark:text-blue-400" />
            </div>
            <h2 className="text-xl font-bold  dark:text-white">
              {title}
            </h2>
          </div>

          <button
            onClick={onClose}
            className="h-9 w-9 rounded-lg cursor-pointer flex items-center justify-center
                       dark:bg-slate-100  dark:hover:bg-slate-700 transition"
          >
            <X className="h-5 w-5  dark:text-slate-400" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {children}
        </div>

      </div>
    </div>
  );
};


export default Modal;


// import React from 'react';
// import { X, Sparkles } from 'lucide-react';
// import { cn } from '@/utils/cn';

// interface ModalProps {
//     isOpen: boolean;
//     onClose: () => void;
//     title: string;
//     children: React.ReactNode;
// }

// const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
//     if (!isOpen) return null;

//     return (
//         <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
//             {/* Professional Backdrop */}
//             <div
//                 className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
//                 onClick={onClose}
//             />

//             {/* Modal with Clean Design */}
//             <div className="relative bg-white border border-slate-200 rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
//                 {/* Header with Blue Accent */}
//                 <div className="relative flex items-center justify-between p-6 border-b border-slate-200 bg-white">
//                     {/* Decorative top border */}
//                     <div className="absolute top-0 left-0 right-0 h-1 bg-blue-600" />

//                     <div className="flex items-center gap-3">
//                         <div className="h-10 w-10 rounded-lg bg-blue-50 flex items-center justify-center">
//                             <Sparkles className="h-5 w-5 text-blue-600" strokeWidth={2} />
//                         </div>
//                         <h2 className="text-xl font-bold text-slate-900">{title}</h2>
//                     </div>

//                     <button
//                         onClick={onClose}
//                         className="h-9 w-9 rounded-lg hover:bg-slate-100 border border-transparent hover:border-slate-200 flex items-center justify-center transition-colors group"
//                     >
//                         <X className="h-5 w-5 text-slate-600 group-hover:text-slate-900 transition-colors" />
//                     </button>
//                 </div>

//                 {/* Content */}
//                 <div className="flex-1 overflow-y-auto p-6 bg-white">
//                     {children}
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default Modal;