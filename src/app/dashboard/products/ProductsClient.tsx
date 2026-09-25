"use client";

import React, { useState } from 'react';
import { Plus, Package, Loader2, Trash2, Camera, ImageIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import imageCompression from 'browser-image-compression';

export default function ProductsClient({ initialProducts, seasons }: { initialProducts: any[], seasons: any[] }) {
  const router = useRouter();
  const [products, setProducts] = useState(initialProducts);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [imageFile, setImageFile] = useState<File | null>(null);
  const defaultForm = {
    seasonId: seasons[0]?.id || '',
    name: '',
    size: '',
    material: 'POP',
    purchasePrice: '',
    sellingPrice: '',
    qtyPurchased: '',
  };
  const [formData, setFormData] = useState(defaultForm);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  const openNewModal = () => {
    setFormData(defaultForm);
    setIsEditMode(false);
    setEditingId(null);
    setImageFile(null);
    setIsModalOpen(true);
  };

  const openEditModal = (product: any) => {
    setFormData({
      seasonId: product.seasonId,
      name: product.name,
      size: product.size || '',
      material: product.material,
      purchasePrice: product.purchasePrice.toString(),
      sellingPrice: product.sellingPrice.toString(),
      qtyPurchased: product.qtyPurchased.toString(),
    });
    setIsEditMode(true);
    setEditingId(product.id);
    setImageFile(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let imageUrl = null;
      if (imageFile) {
        toast.loading('Compressing and uploading image...', { id: 'upload-toast' });
        
        // Compress image before upload to avoid Vercel's 4.5MB limit
        const options = {
          maxSizeMB: 1,
          maxWidthOrHeight: 1024,
          useWebWorker: true
        };
        const compressedFile = await imageCompression(imageFile, options);
        
        const formDataImg = new FormData();
        formDataImg.append('file', compressedFile);
        const uploadRes = await fetch('/api/upload', {
          method: 'POST',
          body: formDataImg,
        });
        const uploadData = await uploadRes.json();
        if (!uploadRes.ok) {
          toast.dismiss('upload-toast');
          throw new Error(uploadData.error || 'Image upload failed on server');
        }
        imageUrl = uploadData.url;
        toast.dismiss('upload-toast');
      }

      const payload: any = {
        seasonId: formData.seasonId,
        name: formData.name,
        size: formData.size,
        material: formData.material,
        purchasePrice: parseFloat(formData.purchasePrice),
        sellingPrice: parseFloat(formData.sellingPrice),
        qtyPurchased: parseInt(formData.qtyPurchased),
      };
      if (imageUrl) payload.imageUrl = imageUrl;

      if (isEditMode && editingId) {
        const res = await fetch(`/api/products/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to update product');
        
        // Update local state
        setProducts(products.map(p => p.id === editingId ? data.product : p));
        toast.success('Product updated successfully');
      } else {
        const res = await fetch('/api/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to add product');
        
        // Update local state
        setProducts([data.product, ...products]);
        toast.success('Product added successfully');
      }

      setIsModalOpen(false);
      router.refresh();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product? (Cannot be deleted if it has bookings)')) return;
    try {
      const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete product');
      toast.success('Product deleted');
      router.refresh();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <button
          onClick={openNewModal}
          className="inline-flex items-center justify-center rounded-lg border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:w-auto"
        >
          <Plus className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
          Add Product
        </button>
      </div>

      <div className="overflow-x-auto shadow-sm border border-slate-200 dark:border-slate-700 rounded-2xl bg-white dark:bg-slate-800">
        <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
          <thead className="bg-slate-50 dark:bg-slate-900/50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">Product Name</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">Material</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">Size</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">Season</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">Available Qty</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">Selling Price</th>
              <th className="px-6 py-4 text-center text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
            {products.map((product) => (
              <tr 
                key={product.id}
                className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors cursor-pointer"
                onClick={() => openEditModal(product)}
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-12 w-12 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg flex items-center justify-center overflow-hidden border border-slate-200 dark:border-slate-700">
                      {product.imageUrl ? (
                        <img src={product.imageUrl} alt={product.name} className="h-full w-full object-cover" />
                      ) : (
                        <Package className="h-6 w-6 text-indigo-400" />
                      )}
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-bold text-slate-900 dark:text-white">{product.name}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    product.material === 'Eco-friendly' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300'
                  }`}>
                    {product.material}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                  {product.size || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                  {product.season?.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${product.qtyAvailable > 0 ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-800/30 dark:text-emerald-400' : 'bg-rose-100 text-rose-800 dark:bg-rose-800/30 dark:text-rose-400'}`}>
                    {product.qtyAvailable} / {product.qtyPurchased}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                  ₹{product.sellingPrice}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                  <div className="flex items-center justify-center gap-3" onClick={(e) => e.stopPropagation()}>
                    <button onClick={() => handleDelete(product.id)} className="text-slate-400 hover:text-rose-600 transition-colors p-2 rounded-full hover:bg-rose-50 dark:hover:bg-rose-900/20 inline-flex" title="Delete Product">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-sm text-slate-500">
                  No products added yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="relative z-50" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="fixed inset-0 bg-slate-900/75 backdrop-blur-sm transition-opacity" onClick={() => setIsModalOpen(false)}></div>
          <div className="fixed inset-0 z-10 overflow-y-auto">
            <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
              <div className="relative transform overflow-hidden rounded-2xl bg-white dark:bg-slate-800 text-left shadow-xl transition-all w-full max-w-full sm:my-8 sm:w-full sm:max-w-xl border border-slate-200 dark:border-slate-700 max-h-[85vh] overflow-y-auto">
                <form onSubmit={handleSubmit}>
                  <div className="px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-medium leading-6 text-slate-900 dark:text-white" id="modal-title">
                        {isEditMode ? 'Product Details' : 'Add New Product'}
                      </h3>
                      {isEditMode && (
                        <button type="button" onClick={() => { setIsModalOpen(false); handleDelete(editingId!); }} className="text-sm font-semibold text-rose-600 hover:text-rose-500 bg-rose-50 px-3 py-1 rounded-md flex items-center gap-1">
                          <Trash2 className="w-3 h-3" /> Delete
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-1 gap-y-4 gap-x-4 sm:grid-cols-2">
                      <div className="sm:col-span-2">
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Season</label>
                        <select required name="seasonId" value={formData.seasonId} onChange={handleChange} className="mt-1 block w-full rounded-lg border-slate-300 dark:border-slate-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-white dark:bg-slate-900 px-3 py-2 border">
                          {seasons.map(s => <option key={s.id} value={s.id}>{s.name} ({s.year})</option>)}
                        </select>
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Product Name / Design</label>
                        <input required type="text" name="name" value={formData.name} onChange={handleChange} placeholder="e.g. Traditional Ganpati" className="mt-1 block w-full rounded-lg border-slate-300 dark:border-slate-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-white dark:bg-slate-900 px-3 py-2 border" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Material Type</label>
                        <select required name="material" value={formData.material} onChange={handleChange} className="mt-1 block w-full rounded-lg border-slate-300 dark:border-slate-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-white dark:bg-slate-900 px-3 py-2 border">
                          <option value="POP">POP</option>
                          <option value="Eco-friendly">Eco-friendly (Shadu Mati)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Size / Height</label>
                        <input type="text" name="size" value={formData.size} onChange={handleChange} placeholder="e.g. 3 Feet" className="mt-1 block w-full rounded-lg border-slate-300 dark:border-slate-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-white dark:bg-slate-900 px-3 py-2 border" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Quantity Purchased</label>
                        <input required type="number" min="0" name="qtyPurchased" value={formData.qtyPurchased} onChange={handleChange} className="mt-1 block w-full rounded-lg border-slate-300 dark:border-slate-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-white dark:bg-slate-900 px-3 py-2 border" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Purchase Price (₹)</label>
                        <input required type="number" min="0" step="0.01" name="purchasePrice" value={formData.purchasePrice} onChange={handleChange} className="mt-1 block w-full rounded-lg border-slate-300 dark:border-slate-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-white dark:bg-slate-900 px-3 py-2 border" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Selling Price (₹)</label>
                        <input required type="number" min="0" step="0.01" name="sellingPrice" value={formData.sellingPrice} onChange={handleChange} className="mt-1 block w-full rounded-lg border-slate-300 dark:border-slate-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-white dark:bg-slate-900 px-3 py-2 border" />
                      </div>
                      <div className="sm:col-span-2 border-t border-slate-200 dark:border-slate-700 pt-4 mt-2">
                        <h4 className="text-sm font-medium text-indigo-600 dark:text-indigo-400 mb-3">Product Photo</h4>
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Ganpati Photo</label>
                        <div className="flex gap-2 mt-1">
                          <label className="flex-1 cursor-pointer flex flex-col items-center justify-center gap-1 py-3 px-2 border-2 border-dashed border-indigo-200 dark:border-indigo-800/50 rounded-xl bg-indigo-50/50 dark:bg-indigo-900/10 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-colors">
                            <Camera className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                            <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">Take Photo</span>
                            <input type="file" accept="image/*" capture="environment" onChange={handleImageChange} className="hidden" />
                          </label>
                          <label className="flex-1 cursor-pointer flex flex-col items-center justify-center gap-1 py-3 px-2 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50/50 dark:bg-slate-800/30 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                            <ImageIcon className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                            <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">From Gallery</span>
                            <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                          </label>
                        </div>
                        {imageFile && (
                          <div className="mt-2 p-2 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg flex items-center justify-between border border-indigo-100 dark:border-indigo-800/30">
                            <span className="text-xs font-medium text-indigo-600 dark:text-indigo-400 truncate max-w-[200px]">{imageFile.name}</span>
                            <button type="button" onClick={() => setImageFile(null)} className="text-rose-500 hover:text-rose-600 bg-rose-50 dark:bg-rose-900/30 p-1 rounded-md">
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        )}
                        <p className="mt-2 text-[10px] text-slate-500">This photo will be used to easily identify the model during booking.</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-900/50 px-4 py-4 sm:flex sm:flex-row-reverse sm:px-6 border-t border-slate-200 dark:border-slate-700 pb-10 sm:pb-4 sticky bottom-0 z-10 rounded-b-2xl">
                    <button type="submit" disabled={loading} className="inline-flex w-full justify-center rounded-lg border border-transparent bg-indigo-600 px-4 py-3 sm:py-2 text-base font-bold text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50">
                      {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : isEditMode ? 'Save Changes' : 'Save Product'}
                    </button>
                    <button type="button" onClick={() => setIsModalOpen(false)} className="mt-3 sm:mt-0 inline-flex w-full justify-center rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-4 py-3 sm:py-2 text-base font-bold text-slate-700 dark:text-slate-300 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:w-auto sm:text-sm">
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
