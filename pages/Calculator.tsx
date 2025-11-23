import React, { useState, useRef, useMemo } from 'react';
import { Calculator as CalcIcon, Plus, Trash2, Save, History, Printer, Loader2 } from 'lucide-react';
import { useFarmData } from '../context/FarmContext';
import { CalculatorComputation } from '../types';
import html2canvas from 'html2canvas';
import { format } from 'date-fns';
import AlertModal from '../components/modals/AlertModal';
import DeleteConfirmationModal from '../components/modals/DeleteConfirmationModal';

const Calculator: React.FC = () => {
  const { services, computations, isLoading } = useFarmData();
  const [activeTab, setActiveTab] = useState<'calculator' | 'history'>('calculator');
  const [isSaving, setIsSaving] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);

  // Modal States
  const [alertState, setAlertState] = useState<{ isOpen: boolean; title: string; message: string; type: 'success' | 'error' | 'info' }>({
    isOpen: false, title: '', message: '', type: 'info'
  });
  
  const [deleteState, setDeleteState] = useState<{ isOpen: boolean; id: string | null }>({
    isOpen: false, id: null
  });
  const [isDeleting, setIsDeleting] = useState(false);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Receipt Settings
  const [receiptTitle, setReceiptTitle] = useState('JAMES TRADING');
  const [signatureName, setSignatureName] = useState('James');

  // Calculator Entries
  const [sugarcaneEntries, setSugarcaneEntries] = useState<{id: number, bags: number, price: number}[]>([
    { id: 1, bags: 0, price: 0 }
  ]);
  
  const [molassesEntries, setMolassesEntries] = useState<{id: number, kilos: number, price: number}[]>([
    { id: 1, kilos: 0, price: 0 }
  ]);

  // Print Ref
  const receiptRef = useRef<HTMLDivElement>(null);
  const [receiptDataToPrint, setReceiptDataToPrint] = useState<CalculatorComputation | null>(null);

  // Sorting & Pagination Logic
  const sortedComputations = useMemo(() => {
    return [...computations].sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [computations]);

  const totalPages = Math.ceil(sortedComputations.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = sortedComputations.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
        setCurrentPage(page);
    }
  };

  const addSugarcane = () => {
    setSugarcaneEntries([...sugarcaneEntries, { id: Date.now(), bags: 0, price: 0 }]);
  };

  const addMolasses = () => {
    setMolassesEntries([...molassesEntries, { id: Date.now(), kilos: 0, price: 0 }]);
  };

  const updateSugarcane = (id: number, field: 'bags' | 'price', value: number) => {
    setSugarcaneEntries(sugarcaneEntries.map(e => e.id === id ? { ...e, [field]: value } : e));
  };

  const updateMolasses = (id: number, field: 'kilos' | 'price', value: number) => {
    setMolassesEntries(molassesEntries.map(e => e.id === id ? { ...e, [field]: value } : e));
  };

  const removeSugarcane = (id: number) => {
     if(sugarcaneEntries.length > 1)
      setSugarcaneEntries(sugarcaneEntries.filter(e => e.id !== id));
  };

  const removeMolasses = (id: number) => {
    if(molassesEntries.length > 1)
      setMolassesEntries(molassesEntries.filter(e => e.id !== id));
  };

  const totalSugarcane = sugarcaneEntries.reduce((sum, e) => sum + (e.bags * e.price), 0);
  const totalMolasses = molassesEntries.reduce((sum, e) => sum + (e.kilos * e.price), 0);
  const grandTotal = totalSugarcane + totalMolasses;

  const handleSave = async () => {
    if (grandTotal === 0) {
        setAlertState({
            isOpen: true,
            title: 'Empty Computation',
            message: 'Cannot save a computation with zero value. Please add items.',
            type: 'error'
        });
        return;
    }
    setIsSaving(true);
    try {
        await services.computations.add({
            receiptTitle,
            signatureName,
            sugarcaneEntries,
            molassesEntries,
            totalSugarcane,
            totalMolasses,
            grandTotal,
            createdAt: new Date().toISOString()
        });
        
        setAlertState({
            isOpen: true,
            title: 'Saved Successfully',
            message: 'The computation has been saved to your history.',
            type: 'success'
        });

        // Reset for next calculation
        setSugarcaneEntries([{ id: Date.now(), bags: 0, price: 0 }]);
        setMolassesEntries([{ id: Date.now()+1, kilos: 0, price: 0 }]);
        // Switch to history tab to see new entry
        setActiveTab('history');
        setCurrentPage(1); 
    } catch (error) {
        setAlertState({
            isOpen: true,
            title: 'Save Failed',
            message: 'An error occurred while saving the computation.',
            type: 'error'
        });
        console.error(error);
    } finally {
        setIsSaving(false);
    }
  };

  const handleDeleteClick = (id: string) => {
      setDeleteState({ isOpen: true, id });
  };

  const confirmDelete = async () => {
      if (!deleteState.id) return;
      
      setIsDeleting(true);
      try {
          await services.computations.delete(deleteState.id);
          // Adjust pagination if deleting the last item on a page
          if (currentItems.length === 1 && currentPage > 1) {
              setCurrentPage(currentPage - 1);
          }
          setDeleteState({ isOpen: false, id: null });
      } catch (error) {
          console.error("Failed to delete", error);
          setAlertState({
              isOpen: true,
              title: 'Delete Failed',
              message: 'Could not delete the record.',
              type: 'error'
          });
      } finally {
          setIsDeleting(false);
      }
  };

  const handleDownloadImage = async (comp: CalculatorComputation) => {
      setReceiptDataToPrint(comp);
      setIsGeneratingImage(true);
      
      // Small delay to allow React to render the hidden component with new data
      setTimeout(async () => {
          if (receiptRef.current) {
              try {
                  const canvas = await html2canvas(receiptRef.current, {
                      width: 384, // Fixed width for thermal printer
                      scale: 2, // Higher scale for better quality then downsized if needed
                      backgroundColor: '#ffffff',
                      logging: false
                  });
                  
                  const image = canvas.toDataURL("image/png");
                  const link = document.createElement("a");
                  link.href = image;
                  link.download = `Receipt_${comp.receiptTitle.replace(/\s+/g, '_')}_${format(new Date(comp.createdAt), 'yyyy-MM-dd')}.png`;
                  link.click();
              } catch (error) {
                  console.error("Image generation failed", error);
                  setAlertState({
                      isOpen: true,
                      title: 'Download Failed',
                      message: 'Failed to generate the receipt image.',
                      type: 'error'
                  });
              } finally {
                  setIsGeneratingImage(false);
                  setReceiptDataToPrint(null);
              }
          }
      }, 500);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      
      {/* Header & Tabs */}
      <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-4 mb-4">
        <div className="flex items-center gap-3">
            <div className="p-3 bg-sage-600 rounded-xl text-white shadow-lg">
            <CalcIcon size={32} />
            </div>
            <div>
            <h1 className="text-2xl font-bold text-sage-800">Calculator</h1>
            <p className="text-sage-500 text-sm">Compute & Print Receipts</p>
            </div>
        </div>
        
        <div className="bg-white p-1 rounded-lg border border-sage-200 flex">
            <button 
                onClick={() => setActiveTab('calculator')}
                className={`px-4 py-2 text-sm font-bold rounded-md transition-colors flex items-center gap-2
                    ${activeTab === 'calculator' ? 'bg-sage-600 text-white shadow-sm' : 'text-sage-500 hover:bg-sage-50'}
                `}
            >
                <CalcIcon size={16} /> Calculator
            </button>
            <button 
                onClick={() => setActiveTab('history')}
                className={`px-4 py-2 text-sm font-bold rounded-md transition-colors flex items-center gap-2
                    ${activeTab === 'history' ? 'bg-sage-600 text-white shadow-sm' : 'text-sage-500 hover:bg-sage-50'}
                `}
            >
                <History size={16} /> History
            </button>
        </div>
      </div>

      {/* TAB: CALCULATOR */}
      {activeTab === 'calculator' && (
          <div className="animate-in fade-in slide-in-from-left-4 duration-300 space-y-6">
            {/* Receipt Settings */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-sage-100 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-xs font-bold text-sage-400 uppercase mb-1">Receipt Title</label>
                    <input 
                        type="text" 
                        value={receiptTitle}
                        onChange={(e) => setReceiptTitle(e.target.value)}
                        className="w-full border border-sage-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-sage-400 outline-none font-bold text-sage-800"
                        placeholder="JAMES TRADING"
                    />
                </div>
                <div>
                    <label className="block text-xs font-bold text-sage-400 uppercase mb-1">Signatory Name</label>
                    <input 
                        type="text" 
                        value={signatureName}
                        onChange={(e) => setSignatureName(e.target.value)}
                        className="w-full border border-sage-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-sage-400 outline-none font-medium text-sage-800"
                        placeholder="James"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Sugarcane Section */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-sage-100">
                    <div className="flex justify-between items-center mb-4 border-b border-sage-100 pb-4">
                    <h3 className="font-bold text-lg text-sage-800">Sugarcane</h3>
                    <button onClick={addSugarcane} className="text-sage-600 hover:bg-sage-50 p-2 rounded-full transition-colors"><Plus size={20}/></button>
                    </div>
                    <div className="space-y-3">
                    {sugarcaneEntries.map((entry, idx) => (
                        <div key={entry.id} className="flex items-center gap-2">
                            <span className="text-xs text-sage-400 w-6 text-center">{idx + 1}</span>
                            <div className="flex-1 relative">
                                <input 
                                type="number" 
                                placeholder="Price"
                                className="w-full bg-sage-50 border-none rounded-lg py-2 pl-6 pr-3 text-sm focus:ring-1 focus:ring-sage-400 font-mono"
                                value={entry.price || ''}
                                onChange={(e) => updateSugarcane(entry.id, 'price', parseFloat(e.target.value) || 0)}
                                />
                                <span className="absolute left-2 top-2 text-xs text-sage-400">₱</span>
                            </div>
                            <div className="text-sage-400">×</div>
                            <div className="flex-1 relative">
                                <input 
                                type="number" 
                                placeholder="Bags"
                                className="w-full bg-sage-50 border-none rounded-lg py-2 px-3 text-sm focus:ring-1 focus:ring-sage-400 font-mono"
                                value={entry.bags || ''}
                                onChange={(e) => updateSugarcane(entry.id, 'bags', parseFloat(e.target.value) || 0)}
                                />
                                <span className="absolute right-2 top-2 text-xs text-sage-400">bags</span>
                            </div>
                            <button onClick={() => removeSugarcane(entry.id)} className="text-red-300 hover:text-red-500"><Trash2 size={16}/></button>
                        </div>
                    ))}
                    </div>
                    <div className="mt-6 pt-4 border-t border-sage-100 flex justify-between items-center">
                    <span className="text-sage-500 font-medium">Subtotal</span>
                    <span className="text-xl font-bold text-sage-800">₱{totalSugarcane.toLocaleString()}</span>
                    </div>
                </div>

                {/* Molasses Section */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-sage-100">
                    <div className="flex justify-between items-center mb-4 border-b border-sage-100 pb-4">
                    <h3 className="font-bold text-lg text-sage-800">Molasses</h3>
                    <button onClick={addMolasses} className="text-sage-600 hover:bg-sage-50 p-2 rounded-full transition-colors"><Plus size={20}/></button>
                    </div>
                    <div className="space-y-3">
                    {molassesEntries.map((entry, idx) => (
                        <div key={entry.id} className="flex items-center gap-2">
                            <span className="text-xs text-sage-400 w-6 text-center">{idx + 1}</span>
                            <div className="flex-1 relative">
                                <input 
                                type="number" 
                                placeholder="Price"
                                className="w-full bg-sage-50 border-none rounded-lg py-2 pl-6 pr-3 text-sm focus:ring-1 focus:ring-sage-400 font-mono"
                                value={entry.price || ''}
                                onChange={(e) => updateMolasses(entry.id, 'price', parseFloat(e.target.value) || 0)}
                                />
                                <span className="absolute left-2 top-2 text-xs text-sage-400">₱</span>
                            </div>
                            <div className="text-sage-400">×</div>
                            <div className="flex-1 relative">
                                <input 
                                type="number" 
                                placeholder="Kilos"
                                className="w-full bg-sage-50 border-none rounded-lg py-2 px-3 text-sm focus:ring-1 focus:ring-sage-400 font-mono"
                                value={entry.kilos || ''}
                                onChange={(e) => updateMolasses(entry.id, 'kilos', parseFloat(e.target.value) || 0)}
                                />
                                <span className="absolute right-2 top-2 text-xs text-sage-400">kg</span>
                            </div>
                            <button onClick={() => removeMolasses(entry.id)} className="text-red-300 hover:text-red-500"><Trash2 size={16}/></button>
                        </div>
                    ))}
                    </div>
                    <div className="mt-6 pt-4 border-t border-sage-100 flex justify-between items-center">
                    <span className="text-sage-500 font-medium">Subtotal</span>
                    <span className="text-xl font-bold text-sage-800">₱{totalMolasses.toLocaleString()}</span>
                    </div>
                </div>
            </div>

            {/* Grand Total & Save */}
            <div className="bg-sage-700 text-white p-6 rounded-2xl shadow-lg flex flex-col sm:flex-row justify-between items-center gap-6">
                <div>
                    <h2 className="text-3xl font-bold">Total Amount</h2>
                    <p className="text-sage-300 text-sm">Sum of all entries</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="text-4xl font-bold tracking-tight font-mono">
                        ₱{grandTotal.toLocaleString()}
                    </div>
                    <button 
                        onClick={handleSave}
                        disabled={isSaving}
                        className="bg-white text-sage-700 hover:bg-sage-50 px-6 py-3 rounded-xl font-bold shadow-md flex items-center gap-2 transition-colors disabled:opacity-70"
                    >
                        {isSaving ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
                        <span className="hidden sm:inline">Save to History</span>
                    </button>
                </div>
            </div>
          </div>
      )}

      {/* TAB: HISTORY */}
      {activeTab === 'history' && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-300">
              {isLoading ? (
                  <div className="text-center py-12 text-sage-400"><Loader2 className="animate-spin mx-auto mb-2"/> Loading history...</div>
              ) : sortedComputations.length === 0 ? (
                  <div className="text-center py-12 text-sage-400 border-2 border-dashed border-sage-200 rounded-xl">
                      <History size={48} className="mx-auto mb-3 opacity-50"/>
                      <p>No saved calculations found.</p>
                  </div>
              ) : (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {currentItems.map(comp => (
                            <div key={comp.id} className="bg-white rounded-lg shadow hover:shadow-lg transition-all duration-300 flex flex-col overflow-hidden border border-gray-200 group">
                                {/* Receipt Top Border */}
                                <div className="h-1 bg-gray-800 w-full"></div>
                                
                                {/* Receipt Content */}
                                <div className="p-5 flex-1 font-mono text-xs text-gray-600 flex flex-col">
                                    {/* Header */}
                                    <div className="text-center mb-4">
                                        <h3 className="font-bold text-sm text-gray-900 uppercase tracking-widest">{comp.receiptTitle}</h3>
                                        <p className="text-[10px] text-gray-400 mt-1">{format(new Date(comp.createdAt), 'MMM dd, yyyy • hh:mm a')}</p>
                                    </div>

                                    {/* Separator */}
                                    <div className="border-b border-dashed border-gray-300 mb-4"></div>

                                    {/* Entries */}
                                    <div className="space-y-4 mb-4 flex-1">
                                        {/* Sugarcane */}
                                        {comp.sugarcaneEntries.length > 0 && (
                                            <div>
                                                <div className="flex justify-between font-bold text-gray-800 mb-1 uppercase text-[10px] tracking-wider">
                                                    <span>Sugarcane</span>
                                                </div>
                                                <div className="space-y-1">
                                                    {comp.sugarcaneEntries.map((e, i) => (
                                                        <div key={i} className="flex justify-between text-[11px]">
                                                            <span>₱{e.price} × {e.bags}</span>
                                                            <span>₱{(e.price * e.bags).toLocaleString()}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                                <div className="flex justify-between font-bold text-gray-800 mt-1 pt-1 border-t border-dashed border-gray-200">
                                                    <span>Subtotal</span>
                                                    <span>₱{comp.totalSugarcane.toLocaleString()}</span>
                                                </div>
                                            </div>
                                        )}

                                        {/* Molasses */}
                                        {comp.molassesEntries.length > 0 && (
                                            <div>
                                                <div className="flex justify-between font-bold text-gray-800 mb-1 uppercase text-[10px] tracking-wider">
                                                    <span>Molasses</span>
                                                </div>
                                                <div className="space-y-1">
                                                    {comp.molassesEntries.map((e, i) => (
                                                        <div key={i} className="flex justify-between text-[11px]">
                                                            <span>₱{e.price} × {e.kilos}</span>
                                                            <span>₱{(e.price * e.kilos).toLocaleString()}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                                <div className="flex justify-between font-bold text-gray-800 mt-1 pt-1 border-t border-dashed border-gray-200">
                                                    <span>Subtotal</span>
                                                    <span>₱{comp.totalMolasses.toLocaleString()}</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Separator */}
                                    <div className="border-b-2 border-gray-800 mb-3"></div>

                                    {/* Grand Total */}
                                    <div className="flex justify-between items-center text-base font-bold text-gray-900 mb-6">
                                        <span>TOTAL</span>
                                        <span>₱{comp.grandTotal.toLocaleString()}</span>
                                    </div>

                                    {/* Signature */}
                                    <div className="text-center mt-auto pt-4">
                                        <div className="w-3/4 border-t border-gray-400 mx-auto mb-1"></div>
                                        <p className="font-bold text-gray-800">{comp.signatureName}</p>
                                        <p className="text-[9px] text-gray-400 uppercase tracking-widest">Authorized Signature</p>
                                    </div>
                                </div>

                                {/* Actions Footer */}
                                <div className="bg-gray-50 px-4 py-3 border-t border-gray-100 flex gap-3 opacity-100 group-hover:opacity-100 transition-opacity">
                                    <button 
                                        onClick={() => handleDownloadImage(comp)}
                                        disabled={isGeneratingImage}
                                        className="flex-1 bg-white border border-gray-300 text-gray-700 hover:bg-gray-100 hover:text-gray-900 py-2 rounded text-xs font-bold transition-colors flex items-center justify-center gap-2 uppercase tracking-wide shadow-sm"
                                    >
                                        {isGeneratingImage && receiptDataToPrint?.id === comp.id ? <Loader2 size={14} className="animate-spin"/> : <Printer size={14} />}
                                        Print Receipt
                                    </button>
                                    <button 
                                        onClick={() => handleDeleteClick(comp.id)}
                                        className="p-2 bg-white border border-red-100 text-red-400 hover:bg-red-50 hover:text-red-600 hover:border-red-200 rounded transition-colors shadow-sm"
                                        title="Delete Record"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Pagination Footer */}
                    {totalPages > 1 && (
                        <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-sage-500 border-t border-sage-200 pt-4">
                            <div>
                                Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, sortedComputations.length)} of {sortedComputations.length} receipts
                            </div>
                            <div className="flex gap-1">
                                <button 
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    className="px-3 py-1 border border-sage-200 rounded hover:bg-white text-xs disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    Previous
                                </button>
                                
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                    <button 
                                        key={page}
                                        onClick={() => handlePageChange(page)}
                                        className={`px-3 py-1 border rounded text-xs transition-colors ${currentPage === page ? 'bg-sage-600 text-white border-sage-600' : 'border-sage-200 hover:bg-white'}`}
                                    >
                                        {page}
                                    </button>
                                ))}

                                <button 
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    disabled={currentPage === totalPages}
                                    className="px-3 py-1 border border-sage-200 rounded hover:bg-white text-xs disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    )}
                  </>
              )}
          </div>
      )}

      {/* HIDDEN RECEIPT TEMPLATE FOR CAPTURE */}
      {/* This is rendered off-screen but active in DOM to capture via html2canvas */}
      <div className="absolute top-0 left-0 overflow-hidden h-0 w-0">
          {receiptDataToPrint && (
              <div 
                ref={receiptRef}
                style={{ 
                    width: '384px', // 48mm @ 203 DPI
                    backgroundColor: '#ffffff',
                    padding: '20px',
                    fontFamily: "'Courier Prime', 'Courier New', monospace",
                    color: '#000',
                    fontSize: '14px',
                    lineHeight: '1.2'
                }}
              >
                  {/* Header */}
                  <div style={{ textAlign: 'center', marginBottom: '15px' }}>
                      <h1 style={{ fontSize: '22px', fontWeight: 'bold', margin: '0 0 10px 0', textTransform: 'uppercase' }}>{receiptDataToPrint.receiptTitle}</h1>
                      <p style={{ fontSize: '12px', margin: 0, color: '#333' }}>
                          {format(new Date(receiptDataToPrint.createdAt), 'MMM dd, yyyy, hh:mm a')}
                      </p>
                  </div>

                  <div style={{ borderBottom: '1px solid #000', margin: '10px 0' }}></div>

                  {/* Sugarcane */}
                  {receiptDataToPrint.sugarcaneEntries.length > 0 && (
                      <div style={{ marginBottom: '15px' }}>
                          <h3 style={{ fontSize: '16px', fontWeight: 'bold', margin: '0 0 8px 0' }}>SUGARCANE</h3>
                          {receiptDataToPrint.sugarcaneEntries.map((entry, i) => (
                              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                  <span>₱{entry.price.toLocaleString('en-US', {minimumFractionDigits: 2})} × {entry.bags} bags</span>
                                  <span style={{ fontWeight: 'bold' }}>₱{(entry.price * entry.bags).toLocaleString('en-US', {minimumFractionDigits: 2})}</span>
                              </div>
                          ))}
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', borderTop: '1px dashed #aaa', paddingTop: '4px' }}>
                              <span style={{ fontWeight: 'bold' }}>Sugarcane Total:</span>
                              <span style={{ fontWeight: 'bold' }}>₱{receiptDataToPrint.totalSugarcane.toLocaleString('en-US', {minimumFractionDigits: 2})}</span>
                          </div>
                      </div>
                  )}

                  {/* Molasses */}
                  {receiptDataToPrint.molassesEntries.length > 0 && (
                      <div style={{ marginBottom: '15px' }}>
                          <h3 style={{ fontSize: '16px', fontWeight: 'bold', margin: '0 0 8px 0' }}>MOLASSES</h3>
                          {receiptDataToPrint.molassesEntries.map((entry, i) => (
                              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                  <span>₱{entry.price.toLocaleString('en-US', {minimumFractionDigits: 2})} × {entry.kilos} kilos</span>
                                  <span style={{ fontWeight: 'bold' }}>₱{(entry.price * entry.kilos).toLocaleString('en-US', {minimumFractionDigits: 2})}</span>
                              </div>
                          ))}
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', borderTop: '1px dashed #aaa', paddingTop: '4px' }}>
                              <span style={{ fontWeight: 'bold' }}>Molasses Total:</span>
                              <span style={{ fontWeight: 'bold' }}>₱{receiptDataToPrint.totalMolasses.toLocaleString('en-US', {minimumFractionDigits: 2})}</span>
                          </div>
                      </div>
                  )}

                  <div style={{ borderBottom: '1px solid #000', margin: '10px 0' }}></div>

                  {/* Grand Total */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '18px', fontWeight: 'bold', marginBottom: '30px' }}>
                      <span>GRAND TOTAL:</span>
                      <span>₱{receiptDataToPrint.grandTotal.toLocaleString('en-US', {minimumFractionDigits: 2})}</span>
                  </div>

                  {/* Signature */}
                  <div style={{ textAlign: 'center', marginTop: '40px' }}>
                      <div style={{ borderTop: '2px solid #000', width: '80%', margin: '0 auto 8px auto' }}></div>
                      <p style={{ fontSize: '16px', fontWeight: 'bold', margin: 0 }}>{receiptDataToPrint.signatureName}</p>
                      <p style={{ fontSize: '12px', margin: 0, color: '#555' }}>Signature</p>
                  </div>
              </div>
          )}
      </div>

      {/* MODALS */}
      <AlertModal
        isOpen={alertState.isOpen}
        onClose={() => setAlertState(prev => ({ ...prev, isOpen: false }))}
        title={alertState.title}
        message={alertState.message}
        type={alertState.type}
      />

      <DeleteConfirmationModal
        isOpen={deleteState.isOpen}
        onClose={() => setDeleteState({ isOpen: false, id: null })}
        onConfirm={confirmDelete}
        title="Delete Receipt"
        message="Are you sure you want to delete this computation history? This action cannot be undone."
        isLoading={isDeleting}
      />

    </div>
  );
};

export default Calculator;