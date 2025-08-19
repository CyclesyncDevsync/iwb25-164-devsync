'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  MagnifyingGlassIcon,
  FunnelIcon,
  Squares2X2Icon,
  ListBulletIcon,
  BookmarkIcon,
  MapIcon,
  ChartBarIcon,
  AdjustmentsHorizontalIcon
} from '@heroicons/react/24/outline';
import { BuyerLayout, MaterialCard, AdvancedSearchSystem } from '@/components/buyer';
import { Material } from '@/types/buyer';

const EnhancedMaterialSearchPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [materials, setMaterials] = useState<Material[]>([]);
  const [filteredMaterials, setFilteredMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const [sortBy, setSortBy] = useState<'relevance' | 'price_low' | 'price_high' | 'rating' | 'distance'>('relevance');
  const [filters, setFilters] = useState({
    category: '',
    priceRange: [0, 100000],
    location: '',
    rating: 0,
    availability: 'all',
    condition: '',
    certifications: []
  });

  // Mock materials data
  useEffect(() => {
    const mockMaterials: Material[] = [
      {
        id: '1',
        title: 'Recycled Steel Beams',
        description: 'High-quality structural steel beams from demolished buildings, perfect for construction projects.',
        price: 15000,
        unit: 'ton',
        quality: 9,
        location: 'Mumbai, Maharashtra',
  distance: 2.5,
  images: ['/api/placeholder/400/300'],
  category: 'metal',
  supplier: {
          id: 'sup1',
          name: 'GreenBuild Materials',
          rating: 4.8,
          totalRatings: 156,
          contact: '+91-90000-00001',
          address: 'Mumbai, Maharashtra',
          verificationLevel: 'verified',
          joinedDate: '2022-03-01',
          totalSales: 1245,
          responseTime: '< 2 hours',
          languages: ['en', 'hi']
  },
        availableQuantity: 50,
        isLiked: false,
        isSaved: false,
        verificationStatus: 'verified',
        isAuction: true,
        auctionEndTime: '2024-02-15T18:00:00Z',
        tags: ['recycled', 'structural', 'certified', 'bulk'],
        specifications: [
          { name: 'grade', value: 'Grade 50' },
          { name: 'length', value: '6-12 meters' },
          { name: 'weight', value: '45-60 kg/m' },
          { name: 'coating', value: 'Galvanized' }
        ],
        minOrderQuantity: 1,
        maxOrderQuantity: 100
      },
      {
        id: '2',
        title: 'Reclaimed Wood Planks',
        description: 'Beautiful teak wood planks salvaged from old furniture and buildings.',
        price: 8500,
        unit: 'cubic meter',
        quality: 8,
        location: 'Bangalore, Karnataka',
        distance: 45.2,
        category: 'wood',
        images: ['/api/placeholder/400/300'],
        supplier: {
          id: 'sup2',
          name: 'Heritage Wood Co.',
          rating: 4.6,
          totalRatings: 89,
          contact: '+91-90000-00002',
          address: 'Bangalore, Karnataka',
          verificationLevel: 'verified',
          joinedDate: '2021-07-15',
          totalSales: 540,
          responseTime: '< 4 hours',
      languages: ['en']
    },
        availableQuantity: 25,
        isLiked: false,
        isSaved: false,
        verificationStatus: 'verified',
        specifications: [
          { name: 'species', value: 'Teak' },
          { name: 'dimensions', value: '2m x 15cm x 5cm' },
          { name: 'moisture', value: '12-15%' },
          { name: 'treatment', value: 'Seasoned' }
        ],
        tags: ['reclaimed', 'premium', 'furniture-grade'],
        minOrderQuantity: 1,
        maxOrderQuantity: 50
      },
      {
        id: '3',
        title: 'Crushed Concrete Aggregate',
        description: 'Processed concrete aggregate suitable for road construction and foundation work.',
        price: 1200,
        unit: 'cubic meter',
        quality: 7,
        location: 'Pune, Maharashtra',
        distance: 15.8,
        category: 'ceramic',
        images: ['/api/placeholder/400/300'],
        supplier: {
          id: 'sup3',
          name: 'Eco Aggregates Ltd.',
          rating: 4.4,
          totalRatings: 234,
          contact: '+91-90000-00003',
          address: 'Pune, Maharashtra',
          verificationLevel: 'basic',
          joinedDate: '2020-11-02',
          totalSales: 980,
          responseTime: '< 1 hour',
          languages: ['en']
        },
        availableQuantity: 500,
        isLiked: false,
        isSaved: false,
        verificationStatus: 'verified',
        specifications: [
          { name: 'size', value: '10-40mm' },
          { name: 'density', value: '1.6 g/cm³' },
          { name: 'absorption', value: '< 2%' },
          { name: 'strength', value: 'Grade I' }
        ],
        tags: ['aggregate', 'construction', 'bulk', 'processed'],
        minOrderQuantity: 10,
        maxOrderQuantity: 1000
      },
      {
        id: '4',
        title: 'Recycled Plastic Lumber',
        description: 'Durable plastic lumber made from recycled HDPE, perfect for outdoor applications.',
        price: 2800,
        unit: 'meter',
        quality: 9,
        location: 'Chennai, Tamil Nadu',
        distance: 78.5,
        category: 'plastic',
        images: ['/api/placeholder/400/300'],
        supplier: {
          id: 'sup4',
          name: 'PlastiWood Industries',
          rating: 4.7,
          totalRatings: 112,
          contact: '+91-90000-00004',
          address: 'Chennai, Tamil Nadu',
          verificationLevel: 'verified',
          joinedDate: '2023-01-10',
          totalSales: 300,
          responseTime: '< 3 hours',
          languages: ['en']
        },
        availableQuantity: 1000,
        isLiked: false,
        isSaved: false,
        verificationStatus: 'verified',
        specifications: [
          { name: 'material', value: '100% Recycled HDPE' },
          { name: 'dimensions', value: '5cm x 10cm x 3m' },
          { name: 'density', value: '0.95 g/cm³' },
          { name: 'uvResistance', value: 'UV Stabilized' }
        ],
        tags: ['recycled', 'plastic', 'outdoor', 'durable'],
        minOrderQuantity: 1,
        maxOrderQuantity: 5000
      },
      {
        id: '5',
        title: 'Salvaged Copper Pipes',
        description: 'High-grade copper pipes recovered from plumbing systems, ideal for new installations.',
        price: 45000,
        unit: 'ton',
        quality: 9,
        location: 'Delhi, Delhi',
        distance: 125.3,
        category: 'metal',
        images: ['/api/placeholder/400/300'],
        supplier: {
          id: 'sup5',
          name: 'MetalCycle Pro',
          rating: 4.9,
          totalRatings: 67,
          contact: '+91-90000-00005',
          address: 'Delhi, Delhi',
          verificationLevel: 'premium',
          joinedDate: '2019-09-20',
          totalSales: 860,
          responseTime: '< 1 hour',
          languages: ['en']
        },
        availableQuantity: 5,
        isLiked: false,
        isSaved: false,
        verificationStatus: 'verified',
        specifications: [
          { name: 'purity', value: '99.9% Cu' },
          { name: 'diameter', value: '15-50mm' },
          { name: 'thickness', value: '1-3mm' },
          { name: 'length', value: '3-6 meters' }
        ],
        tags: ['copper', 'plumbing', 'high-grade', 'salvaged'],
        isAuction: true,
        auctionEndTime: '2024-02-14T20:00:00Z',
        minOrderQuantity: 1,
        maxOrderQuantity: 10
      },
      {
        id: '6',
        title: 'Recycled Glass Cullet',
        description: 'Clean glass cullet from bottles and containers, ready for manufacturing.',
        price: 800,
        unit: 'ton',
        quality: 8,
        location: 'Ahmedabad, Gujarat',
        distance: 95.7,
        category: 'glass',
        images: ['/api/placeholder/400/300'],
        supplier: {
          id: 'sup6',
          name: 'GlassCycle Industries',
          rating: 4.3,
          totalRatings: 198,
          contact: '+91-90000-00006',
          address: 'Ahmedabad, Gujarat',
          verificationLevel: 'basic',
          joinedDate: '2022-05-10',
          totalSales: 410,
          responseTime: '< 2 hours',
          languages: ['en']
        },
        availableQuantity: 100,
        isLiked: false,
        isSaved: false,
        verificationStatus: 'verified',
        specifications: [
          { name: 'color', value: 'Mixed' },
          { name: 'size', value: '5-20mm' },
          { name: 'contamination', value: '< 1%' },
          { name: 'purity', value: '98%+' }
        ],
        tags: ['glass', 'cullet', 'manufacturing', 'clean'],
        minOrderQuantity: 1,
        maxOrderQuantity: 200
      }
    ];

    setMaterials(mockMaterials);
    setFilteredMaterials(mockMaterials);
  }, []);

  // Advanced search integration
  const handleAdvancedSearch = (searchParams: any) => {
    setLoading(true);
    
    // Simulate API call delay
    setTimeout(() => {
      let filtered = materials;

      // Apply search query
      if (searchParams.query) {
        filtered = filtered.filter(material =>
          material.title.toLowerCase().includes(searchParams.query.toLowerCase()) ||
          material.description.toLowerCase().includes(searchParams.query.toLowerCase()) ||
          String(material.category).toLowerCase().includes(searchParams.query.toLowerCase()) ||
          (material.tags || []).some(tag => tag.toLowerCase().includes(searchParams.query.toLowerCase()))
        );
      }

      // Apply filters
      if (searchParams.filters) {
        const { category, priceRange, location, rating, condition, certifications } = searchParams.filters;
        
        if (category) {
          filtered = filtered.filter(material => material.category === category);
        }
        
        if (priceRange) {
          filtered = filtered.filter(material => 
            material.price >= priceRange[0] && material.price <= priceRange[1]
          );
        }
        
        if (location) {
          filtered = filtered.filter(material => 
            material.location.toLowerCase().includes(location.toLowerCase())
          );
        }
        
        if (rating) {
          filtered = filtered.filter(material => material.supplier.rating >= rating);
        }
        
        if (condition) {
          // map condition to verificationStatus or skip if unknown
          filtered = filtered.filter(material => material.verificationStatus === condition || String(material.quality) === String(condition));
        }

        if (certifications && certifications.length > 0) {
          // use tags as a proxy for certifications in this mock data
          filtered = filtered.filter(material =>
            certifications.some((cert: string) =>
              (material.tags || []).some(materialTag =>
                materialTag.toLowerCase().includes(cert.toLowerCase())
              )
            )
          );
        }
      }

      // Apply sorting
      if (searchParams.sortBy) {
        filtered = filtered.sort((a, b) => {
          switch (searchParams.sortBy) {
            case 'price_low':
              return a.price - b.price;
            case 'price_high':
              return b.price - a.price;
            case 'rating':
              return b.supplier.rating - a.supplier.rating;
            case 'distance':
              return a.distance - b.distance;
            default:
              return 0;
          }
        });
      }

      setFilteredMaterials(filtered);
      setLoading(false);
    }, 800);
  };

  const handleQuickSearch = (query: string) => {
    setSearchQuery(query);
    handleAdvancedSearch({ query, filters, sortBy });
  };

  const handleBookmark = (materialId: string) => {
    console.log('Bookmarking material:', materialId);
  };

  const handleContactSupplier = (supplierId: string) => {
    console.log('Contacting supplier:', supplierId);
  };

  const handleViewDetails = (materialId: string) => {
    console.log('Viewing material details:', materialId);
  };

  const handlePlaceBid = (materialId: string, amount: number) => {
    console.log('Placing bid:', materialId, amount);
  };

  return (
    <BuyerLayout>
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Material Discovery</h1>
          <p className="text-gray-600">Find sustainable materials for your projects with advanced search and filtering</p>
        </div>

        {/* Enhanced Search and Filters Bar */}
        <div className="mb-6 bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Quick Search */}
            <div className="flex-1">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search for materials..."
                  value={searchQuery}
                  onChange={(e) => handleQuickSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowAdvancedSearch(!showAdvancedSearch)}
                className={`flex items-center gap-2 px-4 py-2.5 border rounded-lg transition-colors ${
                  showAdvancedSearch 
                    ? 'bg-purple-600 text-white border-purple-600' 
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <AdjustmentsHorizontalIcon className="h-5 w-5" />
                Advanced Search
              </button>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              >
                <option value="relevance">Relevance</option>
                <option value="price_low">Price: Low to High</option>
                <option value="price_high">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
                <option value="distance">Nearest First</option>
              </select>

              <div className="flex border border-gray-300 rounded-lg">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2.5 ${viewMode === 'grid' ? 'bg-purple-600 text-white' : 'text-gray-600 hover:bg-gray-50'}`}
                >
                  <Squares2X2Icon className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2.5 ${viewMode === 'list' ? 'bg-purple-600 text-white' : 'text-gray-600 hover:bg-gray-50'}`}
                >
                  <ListBulletIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Results Summary */}
          <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
            <span>{filteredMaterials.length} materials found</span>
            <div className="flex items-center gap-4">
              <button className="flex items-center gap-1 hover:text-purple-600">
                <MapIcon className="h-4 w-4" />
                Map View
              </button>
              <button className="flex items-center gap-1 hover:text-purple-600">
                <ChartBarIcon className="h-4 w-4" />
                Price Trends
              </button>
              <button className="flex items-center gap-1 hover:text-purple-600">
                <BookmarkIcon className="h-4 w-4" />
                Saved Searches
              </button>
            </div>
          </div>
        </div>

        {/* Advanced Search Panel */}
        {showAdvancedSearch && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6"
          >
            <AdvancedSearchSystem 
              onSearch={handleAdvancedSearch}
              onSaveSearch={() => { /* stub */ }}
              savedSearches={[]}
              loading={loading}
            />
          </motion.div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Searching materials...</p>
          </div>
        )}

        {/* Materials Grid/List */}
        {!loading && (
          <div className={`grid gap-6 ${
            viewMode === 'grid' 
              ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
              : 'grid-cols-1'
          }`}>
            {filteredMaterials.map((material) => (
              <MaterialCard
                key={material.id}
                material={material}
                viewMode={viewMode}
                onLike={(id) => handleBookmark(id)}
                onSave={(id) => handleBookmark(id)}
                onContact={(m) => handleContactSupplier(m.supplier.id)}
                onViewDetails={(m) => handleViewDetails(m.id)}
              />
            ))}
          </div>
        )}

        {/* No Results */}
        {!loading && filteredMaterials.length === 0 && (
          <div className="text-center py-12">
            <MagnifyingGlassIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No materials found</h3>
            <p className="text-gray-600">Try adjusting your search terms or filters</p>
          </div>
        )}

        {/* Load More Button */}
        {!loading && filteredMaterials.length > 0 && (
          <div className="text-center mt-8">
            <button className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
              Load More Materials
            </button>
          </div>
        )}
      </div>
    </BuyerLayout>
  );
};

export default EnhancedMaterialSearchPage;
