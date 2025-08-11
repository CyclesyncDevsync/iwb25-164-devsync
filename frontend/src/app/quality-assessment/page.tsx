'use client';

import { useState } from 'react';
import { Upload, Camera, FileImage, CheckCircle, XCircle, AlertTriangle, BarChart3 } from 'lucide-react';

interface QualityAssessment {
  assessmentId: string;
  wasteStreamId: string;
  fieldAgentId: string;
  assessedAt: string;
  overallScore: number;
  qualityGrade: string;
  approved: boolean;
  visionAnalysis: {
    detectedObjects: any[];
    detectedText: any[];
    imageProperties: any;
  };
  qualityFactors: {
    contamination: {
      contaminationLevel: number;
      contaminants: string[];
      purityScore: number;
      crossContamination: boolean;
    };
    condition: {
      damageLevel: number;
      damageTypes: string[];
      integrityScore: number;
      processable: boolean;
    };
    sorting: {
      accuracyScore: number;
      incorrectItems: string[];
      correctCategory: boolean;
      categoryConfidence: number;
    };
  };
  compliance: {
    environmentalCompliance: boolean;
    safetyCompliance: boolean;
    transportCompliance: boolean;
    violations: string[];
    warnings: string[];
  };
  recommendations: string[];
  issues: string[];
  nextAction: string;
  rejectionReason?: string;
}

export default function QualityAssessment() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [assessment, setAssessment] = useState<QualityAssessment | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    wasteStreamId: '',
    wasteType: 'plastic',
    location: '',
    fieldAgentId: '',
    fileName: ''
  });

  const wasteTypes = ['plastic', 'paper', 'metal', 'glass', 'organic'];

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setFormData(prev => ({ ...prev, fileName: file.name }));
      setError(null);
    }
  };

  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          resolve(reader.result.split(',')[1]);
        } else {
          reject(new Error('Failed to convert file to base64'));
        }
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedFile) {
      setError('Please select an image file');
      return;
    }

    if (!formData.wasteStreamId || !formData.location || !formData.fieldAgentId) {
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const base64Image = await convertToBase64(selectedFile);
      
      const requestBody = {
        wasteStreamId: formData.wasteStreamId,
        wasteType: formData.wasteType,
        location: formData.location,
        fieldAgentId: formData.fieldAgentId,
        imageData: base64Image,
        imageFormat: selectedFile.type.split('/')[1],
        fileName: formData.fileName,
        metadata: {
          collectionTime: new Date().toISOString(),
          fileSize: selectedFile.size.toString()
        }
      };

      const response = await fetch('http://localhost:8082/api/ai/quality/assess-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      setAssessment(result);
    } catch (err) {
      console.error('Error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred while processing the image');
    } finally {
      setLoading(false);
    }
  };

  const getGradeColor = (grade: string) => {
    switch (grade.toLowerCase()) {
      case 'excellent': return 'text-green-600 bg-green-100';
      case 'good': return 'text-blue-600 bg-blue-100';
      case 'fair': return 'text-yellow-600 bg-yellow-100';
      case 'poor': return 'text-orange-600 bg-orange-100';
      case 'rejected': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-green-600';
    if (score >= 70) return 'text-blue-600';
    if (score >= 60) return 'text-yellow-600';
    if (score >= 40) return 'text-orange-600';
    return 'text-red-600';
  };

  const getRgbColorName = (color: { red: number; green: number; blue: number }) => {
    const { red, green, blue } = color;
    
    // Simple color classification based on RGB values
    if (red > green && red > blue) {
      if (red > 200) return 'bright red';
      if (red > 150) return 'red';
      return 'dark red';
    } else if (green > red && green > blue) {
      if (green > 200) return 'bright green';
      if (green > 150) return 'green';
      return 'dark green';
    } else if (blue > red && blue > green) {
      if (blue > 200) return 'bright blue';
      if (blue > 150) return 'blue';
      return 'dark blue';
    } else if (red > 150 && green > 150 && blue < 100) {
      return 'yellow';
    } else if (red > 150 && green < 100 && blue > 150) {
      return 'purple';
    } else if (red < 100 && green > 150 && blue > 150) {
      return 'cyan';
    } else if (red > 200 && green > 200 && blue > 200) {
      return 'white';
    } else if (red < 50 && green < 50 && blue < 50) {
      return 'black';
    } else if (red > 150 && green > 150 && blue > 150) {
      return 'light gray';
    } else if (red > 100 && green > 100 && blue > 100) {
      return 'gray';
    } else if (red > 100 && green > 50 && blue < 50) {
      return 'brown';
    }
    
    return 'mixed';
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">AI Quality Assessment</h1>
          <p className="text-gray-600">Upload waste images for automated quality analysis and compliance checking</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Upload Form */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Upload Waste Image</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* File Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload Image
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <input
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="file-upload"
                  />
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <div className="flex flex-col items-center">
                      {selectedFile ? (
                        <FileImage className="h-12 w-12 text-green-500 mb-2" />
                      ) : (
                        <Upload className="h-12 w-12 text-gray-400 mb-2" />
                      )}
                      <p className="text-sm text-gray-600">
                        {selectedFile ? selectedFile.name : 'Click to upload or drag and drop'}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        JPEG, PNG, WEBP (max 10MB)
                      </p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Form Fields */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Waste Stream ID *
                  </label>
                  <input
                    type="text"
                    value={formData.wasteStreamId}
                    onChange={(e) => setFormData(prev => ({ ...prev, wasteStreamId: e.target.value }))}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="WS123456"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Waste Type
                  </label>
                  <select
                    value={formData.wasteType}
                    onChange={(e) => setFormData(prev => ({ ...prev, wasteType: e.target.value }))}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {wasteTypes.map(type => (
                      <option key={type} value={type}>
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Location *
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Collection Point A"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Field Agent ID *
                </label>
                <input
                  type="text"
                  value={formData.fieldAgentId}
                  onChange={(e) => setFormData(prev => ({ ...prev, fieldAgentId: e.target.value }))}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="AGENT001"
                  required
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-md p-3">
                  <div className="flex">
                    <XCircle className="h-5 w-5 text-red-400 mr-2" />
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                ) : (
                  <Camera className="h-5 w-5 mr-2" />
                )}
                {loading ? 'Analyzing...' : 'Assess Quality'}
              </button>
            </form>
          </div>

          {/* Results */}
          {assessment && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Assessment Results</h2>
              
              {/* Overall Score */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Overall Score</span>
                  <span className={`text-2xl font-bold ${getScoreColor(assessment.overallScore)}`}>
                    {assessment.overallScore.toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${assessment.overallScore >= 70 ? 'bg-green-500' : assessment.overallScore >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`}
                    style={{ width: `${assessment.overallScore}%` }}
                  />
                </div>
              </div>

              {/* Grade and Status */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Quality Grade</p>
                  <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${getGradeColor(assessment.qualityGrade)}`}>
                    {assessment.qualityGrade.toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Status</p>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${assessment.approved ? 'text-green-700 bg-green-100' : 'text-red-700 bg-red-100'}`}>
                    {assessment.approved ? (
                      <>
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Approved
                      </>
                    ) : (
                      <>
                        <XCircle className="h-4 w-4 mr-1" />
                        Rejected
                      </>
                    )}
                  </span>
                </div>
              </div>

              {/* Quality Factors */}
              <div className="mb-6">
                <h3 className="text-md font-semibold mb-3">Quality Breakdown</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-gray-700">Cleanliness</span>
                      <span className="text-xs text-gray-500">How clean and uncontaminated</span>
                    </div>
                    <span className={`font-medium ${getScoreColor(assessment.qualityFactors.contamination.purityScore)}`}>
                      {assessment.qualityFactors.contamination.purityScore.toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-gray-700">Condition</span>
                      <span className="text-xs text-gray-500">How undamaged the items are</span>
                    </div>
                    <span className={`font-medium ${getScoreColor(assessment.qualityFactors.condition.integrityScore)}`}>
                      {assessment.qualityFactors.condition.integrityScore.toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-gray-700">Category Match</span>
                      <span className="text-xs text-gray-500">Does it match selected waste type</span>
                    </div>
                    <span className={`font-medium ${getScoreColor(assessment.qualityFactors.sorting.accuracyScore)}`}>
                      {assessment.qualityFactors.sorting.accuracyScore.toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Google Vision Analysis */}
              <div className="mb-6">
                <h3 className="text-md font-semibold mb-3 flex items-center">
                  <Camera className="h-4 w-4 mr-1 text-blue-500" />
                  What Google AI Detected
                </h3>
                <div className="bg-gray-50 rounded-md p-4 space-y-4">
                  {/* Detected Objects */}
                  {assessment.visionAnalysis.detectedObjects.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 mb-2">Objects Found:</h4>
                      <div className="flex flex-wrap gap-2">
                        {assessment.visionAnalysis.detectedObjects.slice(0, 6).map((obj, index) => (
                          <span 
                            key={index}
                            className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800"
                          >
                            {obj.name} ({(obj.confidence * 100).toFixed(0)}%)
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Detected Text */}
                  {assessment.visionAnalysis.detectedText.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 mb-2">Text/Labels Found:</h4>
                      <div className="flex flex-wrap gap-2">
                        {assessment.visionAnalysis.detectedText.slice(0, 4).map((text, index) => (
                          text.text.trim() && (
                            <span 
                              key={index}
                              className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-green-100 text-green-800"
                            >
                              "{text.text.trim().substring(0, 20)}{text.text.length > 20 ? '...' : ''}"
                            </span>
                          )
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Dominant Colors */}
                  {assessment.visionAnalysis.imageProperties.dominantColors.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 mb-2">Main Colors:</h4>
                      <div className="flex gap-2">
                        {assessment.visionAnalysis.imageProperties.dominantColors.slice(0, 5).map((colorInfo, index) => (
                          <div key={index} className="flex items-center">
                            <div 
                              className="w-4 h-4 rounded-full mr-1 border border-gray-300"
                              style={{ 
                                backgroundColor: `rgb(${colorInfo.color.red}, ${colorInfo.color.green}, ${colorInfo.color.blue})` 
                              }}
                            />
                            <span className="text-xs text-gray-600">
                              {(colorInfo.fraction * 100).toFixed(0)}%
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* AI Summary */}
                  <div className="border-t pt-3 mt-3">
                    <p className="text-sm text-gray-700 italic">
                      "I see {assessment.visionAnalysis.detectedObjects.length > 0 
                        ? assessment.visionAnalysis.detectedObjects.map(obj => obj.name).join(', ')
                        : `${formData.wasteType} items`}
                      {assessment.visionAnalysis.detectedText.length > 0 && 
                        `, with labels saying '${assessment.visionAnalysis.detectedText.slice(0, 2).map(t => t.text.trim().substring(0, 20)).join("', '")}'`}
                      {assessment.visionAnalysis.imageProperties.dominantColors.length > 0 && 
                        `, mostly ${getRgbColorName(assessment.visionAnalysis.imageProperties.dominantColors[0]?.color)} colored`}"
                    </p>
                  </div>
                </div>
              </div>

              {/* Issues and Recommendations */}
              {assessment.issues.length > 0 && (
                <div className="mb-4">
                  <h3 className="text-md font-semibold mb-2 flex items-center">
                    <AlertTriangle className="h-4 w-4 mr-1 text-yellow-500" />
                    Issues Found
                  </h3>
                  <ul className="text-sm text-gray-700 space-y-1">
                    {assessment.issues.map((issue, index) => (
                      <li key={index} className="flex items-start">
                        <span className="text-red-500 mr-2">•</span>
                        {issue}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {assessment.recommendations.length > 0 && (
                <div className="mb-4">
                  <h3 className="text-md font-semibold mb-2">Recommendations</h3>
                  <ul className="text-sm text-gray-700 space-y-1">
                    {assessment.recommendations.map((rec, index) => (
                      <li key={index} className="flex items-start">
                        <span className="text-blue-500 mr-2">•</span>
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Next Action */}
              <div className="bg-gray-50 rounded-md p-3">
                <h3 className="text-sm font-semibold mb-1">Next Action</h3>
                <p className="text-sm text-gray-700 capitalize">{assessment.nextAction.replace('_', ' ')}</p>
                {assessment.rejectionReason && (
                  <p className="text-sm text-red-600 mt-1">{assessment.rejectionReason}</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}