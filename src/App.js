
import React, { useState, useEffect } from 'react'; 
import axios from 'axios';
import './App.css';

function App() {
  const [properties, setProperties] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    price: '',
    description: '',
    propertyType: '',
    imageUrl: ''
  });
  const [filters, setFilters] = useState({
    search: '',
    location: '',
    minPrice: '',
    maxPrice: '',
    propertyType: ''
  });
  const [sorting, setSorting] = useState({ field: '', order: '' });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchProperties();
  }, [filters, sorting]);

  const fetchProperties = async () => {
    try {
      const { search, location, minPrice, maxPrice, propertyType } = filters;
      const response = await axios.get('http://localhost:5000/data', {
        params: { name: search, location, minPrice, maxPrice, propertyType }
      });
      
      let fetchedProperties = response.data;
      if (sorting.field) {
        fetchedProperties.sort((a, b) => {
          if (sorting.field === 'price') {
            return sorting.order === 'asc' ? a.price - b.price : b.price - a.price;
          } else if (sorting.field === 'name') {
            return sorting.order === 'asc' ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);
          }
          return 0;
        });
      }
      setProperties(fetchedProperties);
    } catch (error) {
      console.error('Error fetching properties:', error);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleSortChange = (field) => {
    setSorting((prev) => ({
      field,
      order: prev.order === 'asc' ? 'desc' : 'asc'
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await axios.put(`http://localhost:5000/data/${editingId}`, formData);
        setEditingId(null);
      } else {
        await axios.post('http://localhost:5000/data', formData);
      }
      setFormData({ name: '', location: '', price: '', description: '', propertyType: '', imageUrl: '' });
      fetchProperties();
    } catch (error) {
      console.error('Error saving property:', error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/data/${id}`);
      fetchProperties();
    } catch (error) {
      console.error('Error deleting property:', error);
    }
  };

  const handleEdit = (property) => {
    setEditingId(property._id);
    setFormData({ ...property });
  };

  return (
    <div className="App">
      <h1>Property Management</h1>
      
      <div className="filters">
        <input name="search" placeholder="Search by name" value={filters.search} onChange={handleFilterChange} />
        <input name="location" placeholder="Filter by location" value={filters.location} onChange={handleFilterChange} />
        <input name="minPrice" type="number" placeholder="Min Price" value={filters.minPrice} onChange={handleFilterChange} />
        <input name="maxPrice" type="number" placeholder="Max Price" value={filters.maxPrice} onChange={handleFilterChange} />
        <select name="propertyType" value={filters.propertyType} onChange={handleFilterChange}>
          <option value="">All Types</option>
          <option value="Residential">Residential</option>
          <option value="Commercial">Commercial</option>
        </select>
        <button onClick={fetchProperties}>Apply Filters</button>
      </div>

      <div className="sorting">
  <button onClick={() => handleSortChange('price')}>Sort by Price</button>
  <button onClick={() => handleSortChange('name')}>Sort by Name</button>
   </div>

      <form onSubmit={handleSubmit} className="property-form">
        <input name="name" placeholder="Property Name" value={formData.name} onChange={handleChange} />
        <input name="location" placeholder="Location" value={formData.location} onChange={handleChange} />
        <input name="price" type="number" placeholder="Price" value={formData.price} onChange={handleChange} />
        <input name="description" placeholder="Description" value={formData.description} onChange={handleChange} />
        <input name="propertyType" placeholder="Property Type" value={formData.propertyType} onChange={handleChange} />
        <input name="imageUrl" placeholder="Image URL" value={formData.imageUrl} onChange={handleChange} />
        <button type="submit">{editingId ? 'Edit Property' : 'Add Property'}</button>
      </form>

      <div className="property-list">
        {properties.map(property => (
          <div key={property._id} className="property-item">
            <img src={property.imageUrl} alt={property.name} />
            <h2>{property.name}</h2>
            <p>Location: {property.location}</p>
            <p>Price: ₹{property.price}</p>
            <p>Type: {property.propertyType}</p>
            <button onClick={() => handleEdit(property)}>Edit</button>
            <button onClick={() => handleDelete(property._id)}>Delete</button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
