import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { 
  Loader2, 
  Brain, 
  TrendingUp, 
  Users, 
  BarChart3, 
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Clock
} from 'lucide-react';
import axios from 'axios';
import { useAuth } from '@/store/auth';

const RecommendationDashboard = () => {
  const [modelStatus, setModelStatus] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [retraining, setRetraining] = useState(false);
  const {API} = useAuth();

  // Fetch model status
  const fetchModelStatus = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API}/api/recommendations/status`);
      setModelStatus(response.data.data);
    } catch (error) {
      console.error('Error fetching model status:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch analytics
  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API}/api/recommendations/analytics`);
      setAnalytics(response.data.data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  // Retrain model
  const handleRetrainModel = async () => {
    setRetraining(true);
    try {
      await axios.post(`${API}/api/recommendations/retrain`);
      // Wait a bit and then refresh status
      setTimeout(() => {
        fetchModelStatus();
        fetchAnalytics();
      }, 2000);
    } catch (error) {
      console.error('Error retraining model:', error);
    } finally {
      setRetraining(false);
    }
  };

  useEffect(() => {
    fetchModelStatus();
    fetchAnalytics();
  }, []);

  const getStatusIcon = (isActive) => {
    if (isActive) return <CheckCircle className="w-5 h-5 text-green-500 animate-pulse" />;
    return <AlertCircle className="w-5 h-5 text-red-500 animate-bounce" />;
  };

  const getStatusColor = (isActive) => {
    return isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16 min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-orange-700" />
        <span className="ml-4 text-lg font-semibold text-orange-800">Loading recommendation dashboard...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-purple-100 p-6 md:p-10">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 bg-gradient-to-r from-orange-800 via-orange-600 to-purple-700 rounded-3xl shadow-2xl p-8 md:p-12 relative overflow-hidden">
          <div className="flex items-center gap-6">
            <div className="bg-white/20 rounded-full p-6 shadow-lg animate-float">
              <Brain className="w-16 h-16 text-white drop-shadow-xl" />
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-extrabold text-white drop-shadow-lg tracking-tight mb-2 flex items-center gap-3">
                Recommendation System
                <span className="inline-block bg-white/20 text-white text-lg font-bold px-4 py-1 rounded-full ml-2 animate-pulse">AI</span>
              </h1>
              <p className="text-white/90 text-lg md:text-xl max-w-2xl">
                Get actionable insights and manage your smart menu recommendations. Monitor, retrain, and analyze your AI-powered system in real time.
              </p>
            </div>
          </div>
          <Button 
            onClick={handleRetrainModel} 
            disabled={retraining}
            className="bg-white/20 hover:bg-white/30 text-white font-bold text-lg px-8 py-4 rounded-2xl shadow-lg transition-all duration-200 flex items-center gap-2 border-2 border-white/30"
          >
            {retraining ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Retraining...
              </>
            ) : (
              <>
                <RefreshCw className="w-5 h-5 mr-2" />
                Retrain Model
              </>
            )}
          </Button>
          {/* Decorative Elements */}
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-300/20 rounded-full blur-2xl"></div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto space-y-10">
        {/* Model Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-white/90 rounded-2xl shadow-xl border-0 hover:scale-105 transition-transform duration-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold text-orange-800">Model Status</CardTitle>
              {modelStatus && getStatusIcon(modelStatus.isModelLoaded)}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-900">
                {modelStatus?.isModelLoaded ? 'Active' : 'Inactive'}
              </div>
              <p className="text-xs text-orange-600">
                {modelStatus?.isTraining ? 'Training in progress...' : 'Ready for recommendations'}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-100 to-blue-50 rounded-2xl shadow-xl border-0 hover:scale-105 transition-transform duration-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold text-purple-800">Total Items</CardTitle>
              <Brain className="h-5 w-5 text-purple-700" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-900">
                {modelStatus?.statistics?.totalItems || 0}
              </div>
              <p className="text-xs text-purple-600">
                Available menu items
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-100 to-orange-50 rounded-2xl shadow-xl border-0 hover:scale-105 transition-transform duration-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold text-orange-800">Total Orders</CardTitle>
              <TrendingUp className="h-5 w-5 text-orange-700" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-900">
                {modelStatus?.statistics?.totalOrders || 0}
              </div>
              <p className="text-xs text-orange-600">
                Training data points
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-100 to-purple-50 rounded-2xl shadow-xl border-0 hover:scale-105 transition-transform duration-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold text-blue-800">Last Trained</CardTitle>
              <Clock className="h-5 w-5 text-blue-700" />
            </CardHeader>
            <CardContent>
              <div className="text-sm font-bold text-blue-900">
                {modelStatus?.metadata?.lastTrained ? 
                  new Date(modelStatus.metadata.lastTrained).toLocaleDateString() : 
                  'Never'
                }
              </div>
              <p className="text-xs text-blue-600">
                Model version: {modelStatus?.metadata?.version || 'N/A'}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Analytics Section */}
        {analytics && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Top Co-occurring Items */}
            <Card className="bg-white/90 rounded-2xl shadow-xl border-0 hover:scale-[1.02] transition-transform duration-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-orange-800">
                  <BarChart3 className="w-5 h-5 text-orange-700" />
                  Top Item Combinations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analytics.topCoOccurrences?.slice(0, 5).map((pair, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-orange-50/60 rounded-xl shadow-sm">
                      <div className="flex-1">
                        <div className="text-sm font-medium text-orange-900">
                          {pair.item1?.name} + {pair.item2?.name}
                        </div>
                        <div className="text-xs text-orange-600">
                          {pair.item1?.category} + {pair.item2?.category}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-bold text-orange-800">{pair.frequency}</div>
                        <div className="text-xs text-orange-600">
                          {(pair.confidence * 100).toFixed(1)}% confidence
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Most Popular Items */}
            <Card className="bg-gradient-to-br from-purple-50 to-blue-100 rounded-2xl shadow-xl border-0 hover:scale-[1.02] transition-transform duration-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-purple-800">
                  <TrendingUp className="w-5 h-5 text-purple-700" />
                  Most Popular Items
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analytics.popularItems?.slice(0, 5).map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-purple-50/60 rounded-xl shadow-sm">
                      <div className="flex-1">
                        <div className="text-sm font-medium text-purple-900">{item.serviceId?.name}</div>
                        <div className="text-xs text-purple-600">{item.serviceId?.category}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-bold text-purple-800">{item.features?.popularity || 0}</div>
                        <div className="text-xs text-purple-600">orders</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Category Distribution */}
        {analytics?.categoryStats && (
          <Card className="bg-gradient-to-br from-orange-100 to-purple-50 rounded-2xl shadow-xl border-0 mt-2">
            <CardHeader>
              <CardTitle className="text-orange-800">Menu Category Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {analytics.categoryStats.map((category, index) => (
                  <div key={index} className="text-center">
                    <div className="text-3xl font-extrabold text-orange-700 animate-pulse">{category.count}</div>
                    <div className="text-md text-orange-900 font-semibold">{category._id}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Model Configuration */}
        {modelStatus?.metadata && (
          <Card className="bg-white/90 rounded-2xl shadow-xl border-0 mt-2">
            <CardHeader>
              <CardTitle className="text-orange-800">Model Configuration</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div>
                  <label className="text-sm font-medium text-orange-700">Model Type</label>
                  <div className="text-lg font-bold text-orange-900">{modelStatus.metadata.modelType}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-purple-700">Embedding Dimension</label>
                  <div className="text-lg font-bold text-purple-900">{modelStatus.metadata.modelConfig?.embeddingDimension || 'N/A'}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-blue-700">Training Data Size</label>
                  <div className="text-lg font-bold text-blue-900">{modelStatus.metadata.trainingDataSize}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
      {/* Floating animation keyframes */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default RecommendationDashboard; 