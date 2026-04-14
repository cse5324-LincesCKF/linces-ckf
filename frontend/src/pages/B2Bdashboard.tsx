// import { useApp } from '../context/AppContext';

// const B2BDashboard = () => {
//   const { isSpanish } = useApp();

//   const content = {
//     en: {
//       title: "Manufacturing Dashboard",
//       stats: "Production Queue",
//       activeOrders: "Active Bulk Orders",
//       tracking: "Logistics Status"
//     },
//     es: {
//       title: "Panel de Fabricación",
//       stats: "Cola de Producción",
//       activeOrders: "Pedidos al por Mayor Activos",
//       tracking: "Estado de Logística"
//     }
//   };

//   const active = isSpanish ? content.es : content.en;

//   return (
//     <div className="hero-section dashboard-container">
//       <div className="glass-panel" style={{ width: '80%', padding: '3rem', textAlign: 'left' }}>
//         <h2 className="text-reveal" style={{ fontSize: '2.5rem' }}>{active.title}</h2>
        
//         <div className="feature-grid" style={{ padding: '2rem 0', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
//           <div className="glass-panel feature-card">
//             <span className="status-indicator">{active.stats}</span>
//             <h4 style={{ fontSize: '2rem', marginTop: '1rem' }}>12</h4>
//           </div>
//           <div className="glass-panel feature-card">
//             <span className="status-indicator">{active.activeOrders}</span>
//             <h4 style={{ fontSize: '2rem', marginTop: '1rem' }}>4</h4>
//           </div>
//           <div className="glass-panel feature-card">
//             <span className="status-indicator">{active.tracking}</span>
//             <h4 style={{ fontSize: '2rem', marginTop: '1rem', color: '#4CAF50' }}>On Time</h4>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default B2BDashboard;


import { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import toast from 'react-hot-toast';
import {
  getInventoryView,
  createProduct,
  updateProduct,
  deleteProduct,
  updateInventory,
  type Product,
} from '../services/productService';

type NewProductForm = {
  name_en: string;
  name_es: string;
  description_en: string;
  description_es: string;
  price: number;
  stockQuantity: number;
  category: string;
  imageUrls: string[];
};

const B2BDashboard = () => {
  const { isSpanish } = useApp();

  const [inventory, setInventory] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  const [newProduct, setNewProduct] = useState<NewProductForm>({
    name_en: '',
    name_es: '',
    description_en: '',
    description_es: '',
    price: 0,
    stockQuantity: 0,
    category: '',
    imageUrls: [],
  });

  const content = {
    en: {
      title: 'Inventory Dashboard',
      addBtn: '+ Add Product',
      save: 'Save',
      cancel: 'Cancel',
      delete: 'Delete',
      edit: 'Edit',
      actions: 'Actions',
      confirmDelete: 'Are you sure you want to delete this product?',
      thName: 'Name',
      thStock: 'Stock',
      thPrice: 'Price',
      createSuccess: 'Product created successfully',
      createFail: 'Failed to create product',
      updateSuccess: 'Product updated successfully',
      updateFail: 'Failed to update product',
      deleteSuccess: 'Product deleted successfully',
      deleteFail: 'Failed to delete product',
      inventoryLoadFail: 'Failed to load inventory',
      inventoryUpdateSuccess: 'Inventory updated successfully',
      inventoryUpdateFail: 'Failed to update inventory',
      inventoryNegative: 'Stock cannot be negative',
      loading: 'Loading...',
      addProductTitle: 'Add Product',
      editProductTitle: 'Edit Product',
      nameEn: 'Name (EN)',
      nameEs: 'Name (ES)',
      descEn: 'Description (EN)',
      descEs: 'Description (ES)',
      price: 'Price',
      stockQuantity: 'Stock Quantity',
      category: 'Category',
    },
    es: {
      title: 'Panel de Inventario',
      addBtn: '+ Add Product',
      save: 'Save',
      cancel: 'Cancel',
      delete: 'Delete',
      edit: 'Edit',
      actions: 'Actions',
      confirmDelete: 'Are you sure you want to delete this product?',
      thName: 'Name',
      thStock: 'Stock',
      thPrice: 'Price',
      createSuccess: 'Product created successfully',
      createFail: 'Failed to create product',
      updateSuccess: 'Product updated successfully',
      updateFail: 'Failed to update product',
      deleteSuccess: 'Product deleted successfully',
      deleteFail: 'Failed to delete product',
      inventoryLoadFail: 'Failed to load inventory',
      inventoryUpdateSuccess: 'Inventory updated successfully',
      inventoryUpdateFail: 'Failed to update inventory',
      inventoryNegative: 'Stock cannot be negative',
      loading: 'Loading...',
      addProductTitle: 'Add Product',
      editProductTitle: 'Edit Product',
      nameEn: 'Name (EN)',
      nameEs: 'Name (ES)',
      descEn: 'Description (EN)',
      descEs: 'Description (ES)',
      price: 'Price',
      stockQuantity: 'Stock Quantity',
      category: 'Category',
    },
  };

  const active = isSpanish ? content.es : content.en;

  const resetNewProduct = () => {
    setNewProduct({
      name_en: '',
      name_es: '',
      description_en: '',
      description_es: '',
      price: 0,
      stockQuantity: 0,
      category: '',
      imageUrls: [],
    });
  };

  const fetchInventory = async () => {
  try {
    setLoading(true);
    const data = await getInventoryView();
    setInventory(data);
  } catch (error) {
    console.error('Failed to load inventory:', error);
    toast.error(active.inventoryLoadFail);
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    fetchInventory();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const payload = {
        ...newProduct,
        price: Number(newProduct.price),
        stockQuantity: Number(newProduct.stockQuantity),
        imageUrls:
          newProduct.imageUrls.length > 0
            ? newProduct.imageUrls
            : ['https://via.placeholder.com/150'],
      };

      await createProduct(payload);
      toast.success(active.createSuccess);
      setShowAddModal(false);
      resetNewProduct();
      fetchInventory();
    } catch (error) {
      toast.error(active.createFail);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!editingProduct) return;

    try {
      await updateProduct(editingProduct.id, {
        name_en: editingProduct.name_en,
        name_es: editingProduct.name_es,
        description_en: editingProduct.description_en,
        description_es: editingProduct.description_es,
        price: Number(editingProduct.price),
        stockQuantity: Number(editingProduct.stockQuantity),
        category: editingProduct.category,
        size: editingProduct.size ?? undefined,
        color: editingProduct.color ?? undefined,
        imageUrls: editingProduct.imageUrls,
      });

      toast.success(active.updateSuccess);
      setEditingProduct(null);
      fetchInventory();
    } catch (error) {
      toast.error(active.updateFail);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm(active.confirmDelete)) return;

    try {
      await deleteProduct(id);
      toast.success(active.deleteSuccess);
      fetchInventory();
    } catch (error) {
      console.error('Delete failed:', error);
      toast.error(active.deleteFail);
    }
  };

  const handleUpdateInventory = async (id: string, stockQuantity: number) => {
    if (stockQuantity < 0) {
      toast.error(active.inventoryNegative);
      return;
    }

    try {
      await updateInventory(id, { stockQuantity });
      toast.success(active.inventoryUpdateSuccess);
      fetchInventory();
    } catch (error) {
      toast.error(active.inventoryUpdateFail);
    }
  };

  return (
    <div className="dashboard-container fade-in" style={{ padding: '2rem' }}>
      <div
        className="dashboard-header"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginBottom: '2rem',
        }}
      >
        <h2 className="text-reveal">{active.title}</h2>
        <button
          className="secondary-btn"
          onClick={() => setShowAddModal(true)}
        >
        {active.addBtn}
        </button>
      </div>

      {loading ? (
        <div className="loader">{active.loading}</div>
      ) : (
        <table className="inventory-table">
          <thead>
            <tr>
              <th>{active.thName}</th>
              <th>{active.thStock}</th>
              <th>{active.thPrice}</th>
              <th>{active.actions}</th>
            </tr>
          </thead>
          <tbody>
            {inventory.map((item) => (
              <tr key={item.id}>
                <td>{isSpanish ? item.name_es : item.name_en}</td>
                <td className={item.stockQuantity < 5 ? 'low-stock' : ''}>
                  <input
                    className="custom-input"
                    type="number"
                    min="0"
                    defaultValue={item.stockQuantity}
                    style={{ width: '90px' }}
                    onBlur={(e) =>
                      handleUpdateInventory(item.id, Number(e.target.value))
                    }
                  />
                </td>
                <td>${item.price}</td>
                <td>
                  <div style={{ display: 'flex', gap: '0.8rem' }}>
                    <button
                      className="secondary-btn"
                      onClick={() => setEditingProduct(item)}
                    >
                      {active.edit}
                    </button>
                    <button
                      className="secondary-btn delete-btn"
                      style={{
                        backgroundColor: '#ff4d4f',
                        color: 'white',
                        border: 'none',
                      }}
                      onClick={() => handleDelete(item.id)}
                    >
                      {active.delete}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {showAddModal && (
        <div className="modal-overlay">
          <form
            className="glass-panel"
            onSubmit={handleCreate}
            style={{ padding: '2rem', width: '500px' }}
          >
            <h3 style={{ marginBottom: '1.5rem' }}>{active.addProductTitle}</h3>

            <div
              className="form-grid"
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '1rem',
              }}
            >
              <input
                className="custom-input"
                placeholder={active.nameEn}
                required
                onChange={(e) =>
                  setNewProduct({ ...newProduct, name_en: e.target.value })
                }
              />

              <input
                className="custom-input"
                placeholder={active.nameEs}
                required
                onChange={(e) =>
                  setNewProduct({ ...newProduct, name_es: e.target.value })
                }
              />

              <textarea
                className="custom-input"
                style={{ gridColumn: 'span 2' }}
                placeholder={active.descEn}
                onChange={(e) =>
                  setNewProduct({
                    ...newProduct,
                    description_en: e.target.value,
                  })
                }
              />

              <textarea
                className="custom-input"
                style={{ gridColumn: 'span 2' }}
                placeholder={active.descEs}
                required
                onChange={(e) =>
                  setNewProduct({
                    ...newProduct,
                    description_es: e.target.value,
                  })
                }
              />

              <input
                className="custom-input"
                type="number"
                placeholder={active.price}
                required
                onChange={(e) =>
                  setNewProduct({
                    ...newProduct,
                    price: Number(e.target.value),
                  })
                }
              />

              <input
                className="custom-input"
                type="number"
                placeholder={active.stockQuantity}
                required
                onChange={(e) =>
                  setNewProduct({
                    ...newProduct,
                    stockQuantity: Number(e.target.value),
                  })
                }
              />

              <input
                className="custom-input"
                style={{ gridColumn: 'span 2' }}
                placeholder={active.category}
                onChange={(e) =>
                  setNewProduct({
                    ...newProduct,
                    category: e.target.value,
                  })
                }
              />
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
              <button type="submit" className="secondary-btn">
                {active.save}
              </button>
              <button
                type="button"
                className="secondary-btn"
                onClick={() => setShowAddModal(false)}
              >
                {active.cancel}
              </button>
            </div>
          </form>
        </div>
      )}

      {editingProduct && (
        <div className="modal-overlay">
          <form
            className="glass-panel"
            onSubmit={handleUpdate}
            style={{ padding: '2rem', width: '400px' }}
          >
            <h3>{active.editProductTitle}</h3>

            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
                marginTop: '1rem',
              }}
            >
              <input
                className="custom-input"
                value={editingProduct.name_en}
                onChange={(e) =>
                  setEditingProduct({
                    ...editingProduct,
                    name_en: e.target.value,
                  })
                }
              />

              <input
                className="custom-input"
                type="number"
                value={editingProduct.price}
                onChange={(e) =>
                  setEditingProduct({
                    ...editingProduct,
                    price: Number(e.target.value),
                  })
                }
              />

              <input
                className="custom-input"
                type="number"
                value={editingProduct.stockQuantity}
                onChange={(e) =>
                  setEditingProduct({
                    ...editingProduct,
                    stockQuantity: Number(e.target.value),
                  })
                }
              />

              <div style={{ display: 'flex', gap: '1rem' }}>
                <button type="submit" className="secondary-btn">
                  {active.save}
                </button>
                <button
                  type="button"
                  className="secondary-btn"
                  onClick={() => setEditingProduct(null)}
                >
                  {active.cancel}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default B2BDashboard;