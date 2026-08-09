import { Printer, X } from 'lucide-react';
import { useEffect, useRef } from 'react';

import InvoiceDocument from '@/components/invoice/InvoiceDocument';
import Button from '@/components/ui/Button';
import type { InvoiceData } from '@/types/invoice';

type InvoicePreviewModalProps = {
  data: InvoiceData | null;
  onClose: () => void;
};

const PRINT_WRAPPER_ID = 'invoice-print-clone-wrapper';

const InvoicePreviewModal = ({ data, onClose }: InvoicePreviewModalProps) => {
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const cleanupPrintClone = () => {
      document.getElementById(PRINT_WRAPPER_ID)?.remove();
      document.body.classList.remove('is-printing-invoice');
    };

    window.addEventListener('afterprint', cleanupPrintClone);

    return () => {
      window.removeEventListener('afterprint', cleanupPrintClone);
      cleanupPrintClone();
    };
  }, []);

  if (!data) {
    return null;
  }

  const handlePrint = () => {
    const source = printRef.current;

    if (!source) {
      return;
    }

    document.getElementById(PRINT_WRAPPER_ID)?.remove();

    const wrapper = document.createElement('div');
    wrapper.id = PRINT_WRAPPER_ID;

    const clone = source.cloneNode(true) as HTMLDivElement;
    clone.className = 'invoice-print-sheet mx-auto w-full max-w-none bg-white text-text';

    wrapper.appendChild(clone);
    document.body.appendChild(wrapper);
    document.body.classList.add('is-printing-invoice');

    window.print();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-text/35 backdrop-blur-sm"
        aria-label="Cerrar vista de factura"
        onClick={onClose}
      />

      <div className="relative z-10 flex w-full max-w-[860px] flex-col gap-4">
        <div className="flex justify-end gap-2">
          <Button leftIcon={<Printer className="size-4" />} onClick={handlePrint}>
            Imprimir factura
          </Button>
          <Button variant="outline" leftIcon={<X className="size-4" />} onClick={onClose}>
            Cerrar
          </Button>
        </div>

        <div className="max-h-[85vh] overflow-y-auto rounded-2xl bg-white shadow-2xl">
          <div ref={printRef}>
            <InvoiceDocument data={data} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoicePreviewModal;
