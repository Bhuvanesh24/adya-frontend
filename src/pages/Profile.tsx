import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, X, FileText, Download, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";

const Profile = () => {
  // Backend URL configuration
  const API_BASE_URL = process.env.NODE_ENV === 'production' 
    ? 'https://your-backend-domain.com' 
    : 'http://localhost:5000';
  
  // State for user data
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingResume, setUploadingResume] = useState(false);
  const [uploadingCoverLetter, setUploadingCoverLetter] = useState(false);
  
  // Form states
  const [personalInfo, setPersonalInfo] = useState({
    name: "",
    email: "",
    phone: "",
    location: ""
  });
  
  const [professionalInfo, setProfessionalInfo] = useState({
    jobTitle: "",
    yearsOfExperience: "",
    expectedSalary: "",
    workMode: ""
  });
  
  const [skills, setSkills] = useState([]);
  const [newSkill, setNewSkill] = useState("");
  const [professionalSummary, setProfessionalSummary] = useState("");
  const [documents, setDocuments] = useState({ resumes: [], coverLetters: [] });

  // Fetch user profile data
  const fetchUserProfile = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/user/`, {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        const userData = data.user;
        
        setUser(userData);
        setPersonalInfo({
          name: userData.name || "",
          email: userData.email || "",
          phone: userData.phone || "",
          location: userData.location || ""
        });
        
        setProfessionalInfo({
          jobTitle: userData.jobTitle || "",
          yearsOfExperience: userData.yearsOfExperience || "",
          expectedSalary: userData.jobPreferences?.expectedSalary || "",
          workMode: userData.jobPreferences?.workMode || ""
        });
        
        setSkills(userData.skills || []);
        setProfessionalSummary(userData.professionalSummary || "");
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch user documents
  const fetchDocuments = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/user/documents`, {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setDocuments({
          resumes: data.resumes || [],
          coverLetters: data.coverLetters || []
        });
      }
    } catch (error) {
      console.error('Error fetching documents:', error);
    }
  };

  useEffect(() => {
    fetchUserProfile();
    fetchDocuments();
  }, []);

  // Update personal information
  const updatePersonalInfo = async () => {
    try {
      setSaving(true);
      const response = await fetch(`${API_BASE_URL}/api/user/personal-info`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(personalInfo)
      });
      
      if (response.ok) {
        console.log('Personal info updated successfully');
      }
    } catch (error) {
      console.error('Error updating personal info:', error);
    } finally {
      setSaving(false);
    }
  };

  // Update professional summary
  const updateProfessionalSummary = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/user/professional-summary`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ professionalSummary })
      });
      
      if (response.ok) {
        console.log('Professional summary updated successfully');
      }
    } catch (error) {
      console.error('Error updating professional summary:', error);
    }
  };

  // Update job preferences
  const updateJobPreferences = async () => {
    try {
      const jobPreferences = {
        expectedSalary: professionalInfo.expectedSalary,
        workMode: professionalInfo.workMode
      };
      
      const response = await fetch(`${API_BASE_URL}/api/user/job-preferences`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ jobPreferences })
      });
      
      if (response.ok) {
        console.log('Job preferences updated successfully');
      }
    } catch (error) {
      console.error('Error updating job preferences:', error);
    }
  };

  // Add skill
  const addSkill = async () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      try {
        const response = await fetch('/api/user/skills/add', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({ skill: newSkill.trim() })
        });
        
        if (response.ok) {
          const data = await response.json();
          setSkills(data.skills);
          setNewSkill("");
        }
      } catch (error) {
        console.error('Error adding skill:', error);
      }
    }
  };

  // Remove skill
  const removeSkill = async (skillToRemove) => {
    try {
      const response = await fetch('/api/user/skills/remove', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ skill: skillToRemove })
      });
      
      if (response.ok) {
        const data = await response.json();
        setSkills(data.skills);
      }
    } catch (error) {
      console.error('Error removing skill:', error);
    }
  };

  // Handle file upload
  const handleFileUpload = async (file, type) => {
    const formData = new FormData();
    formData.append(type === 'resume' ? 'resume' : 'coverLetter', file);
    
    try {
      if (type === 'resume') {
        setUploadingResume(true);
      } else {
        setUploadingCoverLetter(true);
      }
      
      const response = await fetch(`/api/user/upload/${type === 'resume' ? 'resume' : 'cover-letter'}`, {
        method: 'POST',
        credentials: 'include',
        body: formData
      });
      
      if (response.ok) {
        fetchDocuments(); // Refresh documents list
      }
    } catch (error) {
      console.error(`Error uploading ${type}:`, error);
    } finally {
      if (type === 'resume') {
        setUploadingResume(false);
      } else {
        setUploadingCoverLetter(false);
      }
    }
  };

  // Download file
  const downloadFile = async (filePath, fileName) => {
    try {
      const response = await fetch('/api/user/download/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ filePath })
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Error downloading file:', error);
    }
  };

  // Delete file
  const deleteFile = async (filePath, type) => {
    try {
      const response = await fetch(`/api/user/${type}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ filePath })
      });
      
      if (response.ok) {
        fetchDocuments(); // Refresh documents list
      }
    } catch (error) {
      console.error(`Error deleting ${type}:`, error);
    }
  };

  // Save all changes
  const saveAllChanges = async () => {
    setSaving(true);
    try {
      await Promise.all([
        updatePersonalInfo(),
        updateProfessionalSummary(),
        updateJobPreferences()
      ]);
      alert('All changes saved successfully!');
    } catch (error) {
      console.error('Error saving changes:', error);
      alert('Error saving changes. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addSkill();
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin" />
          <span className="ml-2">Loading profile...</span>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
          <p className="text-gray-600">Manage your personal information and preferences</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Personal Details */}
          <Card>
            <CardHeader>
              <CardTitle>Personal Details</CardTitle>
              <CardDescription>Your basic information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input 
                  id="fullName" 
                  value={personalInfo.name}
                  onChange={(e) => setPersonalInfo({...personalInfo, name: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  type="email" 
                  value={personalInfo.email}
                  onChange={(e) => setPersonalInfo({...personalInfo, email: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input 
                  id="phone" 
                  value={personalInfo.phone}
                  onChange={(e) => setPersonalInfo({...personalInfo, phone: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input 
                  id="location" 
                  value={personalInfo.location}
                  onChange={(e) => setPersonalInfo({...personalInfo, location: e.target.value})}
                />
              </div>
            </CardContent>
          </Card>

          {/* Professional Information */}
          <Card>
            <CardHeader>
              <CardTitle>Professional Information</CardTitle>
              <CardDescription>Your career details and preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="jobTitle">Current Job Title</Label>
                <Input 
                  id="jobTitle" 
                  value={professionalInfo.jobTitle}
                  onChange={(e) => setProfessionalInfo({...professionalInfo, jobTitle: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="experience">Years of Experience</Label>
                <Select 
                  value={professionalInfo.yearsOfExperience}
                  onValueChange={(value) => setProfessionalInfo({...professionalInfo, yearsOfExperience: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select experience level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0-1">0-1 years</SelectItem>
                    <SelectItem value="2-3">2-3 years</SelectItem>
                    <SelectItem value="4-6">4-6 years</SelectItem>
                    <SelectItem value="7-10">7-10 years</SelectItem>
                    <SelectItem value="10+">10+ years</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="salaryRange">Desired Salary Range</Label>
                <Select 
                  value={professionalInfo.expectedSalary}
                  onValueChange={(value) => setProfessionalInfo({...professionalInfo, expectedSalary: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select salary range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="50-70k">$50k - $70k</SelectItem>
                    <SelectItem value="70-90k">$70k - $90k</SelectItem>
                    <SelectItem value="90-120k">$90k - $120k</SelectItem>
                    <SelectItem value="120-150k">$120k - $150k</SelectItem>
                    <SelectItem value="150k+">$150k+</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="workType">Work Type Preference</Label>
                <Select 
                  value={professionalInfo.workMode}
                  onValueChange={(value) => setProfessionalInfo({...professionalInfo, workMode: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select work type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="remote">Remote</SelectItem>
                    <SelectItem value="hybrid">Hybrid</SelectItem>
                    <SelectItem value="onsite">On-site</SelectItem>
                    <SelectItem value="flexible">Flexible</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Skills Section */}
        <Card>
          <CardHeader>
            <CardTitle>Skills</CardTitle>
            <CardDescription>Add your technical and professional skills</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {skills.map((skill) => (
                <Badge key={skill} variant="secondary" className="flex items-center gap-1">
                  {skill}
                  <button onClick={() => removeSkill(skill)} className="ml-1">
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Add a skill"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                onKeyPress={handleKeyPress}
              />
              <Button onClick={addSkill}>Add</Button>
            </div>
          </CardContent>
        </Card>

        {/* Professional Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Professional Summary</CardTitle>
            <CardDescription>Brief overview of your experience and goals</CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Write a brief professional summary..."
              value={professionalSummary}
              onChange={(e) => setProfessionalSummary(e.target.value)}
              rows={4}
            />
          </CardContent>
        </Card>

        {/* Document Management */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Resumes</CardTitle>
              <CardDescription>Upload and manage your resume versions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                <div className="mt-4">
                  <Button 
                    variant="outline" 
                    disabled={uploadingResume}
                    onClick={() => document.getElementById('resume-upload').click()}
                  >
                    {uploadingResume ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      'Upload Resume'
                    )}
                  </Button>
                  <input
                    id="resume-upload"
                    type="file"
                    accept=".pdf,.doc,.docx"
                    style={{ display: 'none' }}
                    onChange={(e) => {
                      if (e.target.files[0]) {
                        handleFileUpload(e.target.files[0], 'resume');
                      }
                    }}
                  />
                  <p className="mt-2 text-sm text-gray-500">PDF, DOC, DOCX up to 5MB</p>
                </div>
              </div>
              
              <div className="space-y-2">
                {documents.resumes.map((resume, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <FileText className="w-5 h-5 text-blue-600" />
                      <div>
                        <p className="font-medium">{resume.fileName}</p>
                        <p className="text-sm text-gray-500">
                          {resume.uploadedAt ? new Date(resume.uploadedAt).toLocaleDateString() : 'Unknown date'}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => downloadFile(resume.filePath, resume.fileName)}
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => deleteFile(resume.filePath, 'resume')}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Cover Letters</CardTitle>
              <CardDescription>Manage your cover letter templates</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                <div className="mt-4">
                  <Button 
                    variant="outline"
                    disabled={uploadingCoverLetter}
                    onClick={() => document.getElementById('cover-letter-upload').click()}
                  >
                    {uploadingCoverLetter ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      'Upload Cover Letter'
                    )}
                  </Button>
                  <input
                    id="cover-letter-upload"
                    type="file"
                    accept=".pdf,.doc,.docx"
                    style={{ display: 'none' }}
                    onChange={(e) => {
                      if (e.target.files[0]) {
                        handleFileUpload(e.target.files[0], 'cover-letter');
                      }
                    }}
                  />
                  <p className="mt-2 text-sm text-gray-500">PDF, DOC, DOCX up to 5MB</p>
                </div>
              </div>
              
              <div className="space-y-2">
                {documents.coverLetters.map((coverLetter, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <FileText className="w-5 h-5 text-green-600" />
                      <div>
                        <p className="font-medium">{coverLetter.fileName}</p>
                        <p className="text-sm text-gray-500">
                          {coverLetter.uploadedAt ? new Date(coverLetter.uploadedAt).toLocaleDateString() : 'Unknown date'}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => downloadFile(coverLetter.filePath, coverLetter.fileName)}
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => deleteFile(coverLetter.filePath, 'cover-letter')}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button size="lg" onClick={saveAllChanges} disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </Button>
        </div>
      </div>
    </Layout>
  );
};

export default Profile;