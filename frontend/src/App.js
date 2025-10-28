import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import axios from "axios";
import { Button } from "./components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./components/ui/card";
import { Input } from "./components/ui/input";
import { Label } from "./components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./components/ui/select";
import { Checkbox } from "./components/ui/checkbox";
import { toast } from "sonner";
import { Search, MapPin, Clock, Briefcase, Star, TrendingUp, Users, FileText, Plus, Filter, ChevronRight } from "lucide-react";
import "@/App.css";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Auth Context
const AuthContext = React.createContext(null);

const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");
    if (token && userData) {
      setUser(JSON.parse(userData));
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    }
    setLoading(false);
  }, []);

  const login = (token, userData) => {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(userData));
    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    delete axios.defaults.headers.common["Authorization"];
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

// Landing Page
const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 to-blue-800/5 z-0"></div>
        
        <nav className="relative z-10 px-6 py-4">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <Briefcase className="w-8 h-8 text-blue-600" />
              <span className="text-2xl font-bold text-gray-900">HospitalityHub</span>
            </div>
            <Button 
              data-testid="nav-login-btn"
              onClick={() => navigate("/login")} 
              className="bg-blue-600 hover:bg-blue-700 text-white px-6"
            >
              Login
            </Button>
          </div>
        </nav>

        <div className="relative z-10 max-w-7xl mx-auto px-6 py-20 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                India's Most Trusted
                <span className="block text-blue-600">Hospitality Job Platform</span>
              </h1>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                Connecting skilled waiters, baristas, and service staff with ethical QSR brands and cafés. 
                Find verified jobs in 48 hours or hire quality candidates at 40% lower cost.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button 
                  data-testid="find-jobs-btn"
                  onClick={() => navigate("/register?role=worker")} 
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-6 text-lg rounded-full"
                >
                  Find Jobs
                  <ChevronRight className="ml-2 w-5 h-5" />
                </Button>
                <Button 
                  data-testid="hire-talent-btn"
                  onClick={() => navigate("/register?role=restaurant")} 
                  variant="outline"
                  className="border-2 border-blue-600 text-blue-600 hover:bg-blue-50 px-8 py-6 text-lg rounded-full"
                >
                  Hire Talent
                </Button>
              </div>
            </div>
            <div className="relative">
              <div className="bg-white rounded-3xl shadow-2xl p-8 space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Average Hiring Time</p>
                    <p className="text-3xl font-bold text-blue-600">48 Hours</p>
                  </div>
                  <Clock className="w-12 h-12 text-blue-600" />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Cost Savings</p>
                    <p className="text-3xl font-bold text-green-600">40% Lower</p>
                  </div>
                  <TrendingUp className="w-12 h-12 text-green-600" />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Verified Employers</p>
                    <p className="text-3xl font-bold text-purple-600">100%</p>
                  </div>
                  <Star className="w-12 h-12 text-purple-600" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-12 text-gray-900">Why Choose HospitalityHub?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-2 hover:border-blue-600 transition-all duration-300">
              <CardContent className="pt-6">
                <Users className="w-12 h-12 text-blue-600 mb-4" />
                <h3 className="text-xl font-semibold mb-2">Verified Employers</h3>
                <p className="text-gray-600">All restaurants verified for wage compliance and work environment standards.</p>
              </CardContent>
            </Card>
            <Card className="border-2 hover:border-blue-600 transition-all duration-300">
              <CardContent className="pt-6">
                <TrendingUp className="w-12 h-12 text-green-600 mb-4" />
                <h3 className="text-xl font-semibold mb-2">Wage Transparency</h3>
                <p className="text-gray-600">See real wage data by role and location before you apply.</p>
              </CardContent>
            </Card>
            <Card className="border-2 hover:border-blue-600 transition-all duration-300">
              <CardContent className="pt-6">
                <FileText className="w-12 h-12 text-purple-600 mb-4" />
                <h3 className="text-xl font-semibold mb-2">Smart Matching</h3>
                <p className="text-gray-600">AI-powered job recommendations based on your skills and preferences.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20 px-6 bg-gradient-to-br from-blue-600 to-blue-800">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">Ready to Get Started?</h2>
          <p className="text-xl text-blue-100 mb-8">Join thousands of hospitality professionals and leading restaurants</p>
          <Button 
            data-testid="get-started-btn"
            onClick={() => navigate("/register")} 
            className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-6 text-lg rounded-full"
          >
            Get Started Today
          </Button>
        </div>
      </div>
    </div>
  );
};

// Login/Register Page
const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    phone: "",
    password: "",
    name: "",
    email: "",
    role: "worker"
  });
  const navigate = useNavigate();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const endpoint = isLogin ? "/auth/login" : "/auth/register";
      const response = await axios.post(`${API}${endpoint}`, formData);
      
      login(response.data.access_token, {
        user_id: response.data.user_id,
        role: response.data.role
      });
      
      toast.success(isLogin ? "Logged in successfully!" : "Registration successful!");
      
      if (response.data.role === "worker") {
        navigate("/worker/jobs");
      } else {
        navigate("/restaurant/dashboard");
      }
    } catch (error) {
      toast.error(error.response?.data?.detail || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center p-6">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl text-center">
            {isLogin ? "Welcome Back" : "Join HospitalityHub"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={isLogin ? "login" : "register"} onValueChange={(v) => setIsLogin(v === "login")}>
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger data-testid="login-tab" value="login">Login</TabsTrigger>
              <TabsTrigger data-testid="register-tab" value="register">Register</TabsTrigger>
            </TabsList>

            <form onSubmit={handleSubmit}>
              {!isLogin && (
                <>
                  <div className="space-y-4 mb-4">
                    <div>
                      <Label>I am a</Label>
                      <Select 
                        value={formData.role} 
                        onValueChange={(v) => setFormData({...formData, role: v})}
                      >
                        <SelectTrigger data-testid="role-select">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="worker">Job Seeker (Worker)</SelectItem>
                          <SelectItem value="restaurant">Employer (Restaurant)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Full Name</Label>
                      <Input 
                        data-testid="name-input"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        required
                      />
                    </div>
                    <div>
                      <Label>Email (Optional)</Label>
                      <Input 
                        data-testid="email-input"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                      />
                    </div>
                  </div>
                </>
              )}
              
              <div className="space-y-4">
                <div>
                  <Label>Phone Number</Label>
                  <Input 
                    data-testid="phone-input"
                    placeholder="+91 XXXXXXXXXX"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label>Password</Label>
                  <Input 
                    data-testid="password-input"
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    required
                  />
                </div>
              </div>

              <Button 
                data-testid="submit-auth-btn"
                type="submit" 
                className="w-full mt-6 bg-blue-600 hover:bg-blue-700"
                disabled={loading}
              >
                {loading ? "Processing..." : (isLogin ? "Login" : "Register")}
              </Button>
            </form>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

// Worker Job Browse
const WorkerJobsPage = () => {
  const [jobs, setJobs] = useState([]);
  const [filters, setFilters] = useState({
    role: "",
    location: "",
    shift: "",
    experience: ""
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    fetchJobs();
  }, [filters]);

  const fetchJobs = async () => {
    try {
      const params = new URLSearchParams();
      if (filters.role) params.append("role", filters.role);
      if (filters.location) params.append("location", filters.location);
      if (filters.shift) params.append("shift", filters.shift);
      if (filters.experience) params.append("experience", filters.experience);

      const response = await axios.get(`${API}/jobs?${params.toString()}`);
      setJobs(response.data);
    } catch (error) {
      toast.error("Failed to load jobs");
    } finally {
      setLoading(false);
    }
  };

  const applyForJob = async (jobId) => {
    try {
      await axios.post(`${API}/applications/${jobId}`);
      toast.success("Application submitted successfully!");
      fetchJobs();
    } catch (error) {
      toast.error(error.response?.data?.detail || "Failed to apply");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <WorkerNav />
      
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Find Your Next Opportunity</h1>
          <p className="text-gray-600">Browse verified hospitality jobs across India</p>
        </div>

        {/* Filters */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="grid md:grid-cols-4 gap-4">
              <div>
                <Label>Role</Label>
                <Select value={filters.role} onValueChange={(v) => setFilters({...filters, role: v})}>
                  <SelectTrigger data-testid="filter-role">
                    <SelectValue placeholder="All Roles" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Roles</SelectItem>
                    <SelectItem value="barista">Barista</SelectItem>
                    <SelectItem value="waiter">Waiter</SelectItem>
                    <SelectItem value="counter_staff">Counter Staff</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Location</Label>
                <Input 
                  data-testid="filter-location"
                  placeholder="City"
                  value={filters.location}
                  onChange={(e) => setFilters({...filters, location: e.target.value})}
                />
              </div>
              <div>
                <Label>Shift</Label>
                <Select value={filters.shift} onValueChange={(v) => setFilters({...filters, shift: v})}>
                  <SelectTrigger data-testid="filter-shift">
                    <SelectValue placeholder="All Shifts" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Shifts</SelectItem>
                    <SelectItem value="morning">Morning</SelectItem>
                    <SelectItem value="evening">Evening</SelectItem>
                    <SelectItem value="night">Night</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Experience</Label>
                <Select value={filters.experience} onValueChange={(v) => setFilters({...filters, experience: v})}>
                  <SelectTrigger data-testid="filter-experience">
                    <SelectValue placeholder="All Levels" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Levels</SelectItem>
                    <SelectItem value="entry">Entry Level</SelectItem>
                    <SelectItem value="1-2">1-2 Years</SelectItem>
                    <SelectItem value="3-5">3-5 Years</SelectItem>
                    <SelectItem value="5+">5+ Years</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Job List */}
        {loading ? (
          <div className="text-center py-12">Loading jobs...</div>
        ) : (
          <div className="grid gap-6">
            {jobs.map((job) => (
              <Card key={job.id} className="job-card hover:shadow-lg" data-testid={`job-card-${job.id}`}>
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">{job.title}</h3>
                      <p className="text-lg text-blue-600 font-medium mb-3">{job.restaurant_name}</p>
                      <div className="flex flex-wrap gap-3 mb-4">
                        <span className="flex items-center text-gray-600">
                          <MapPin className="w-4 h-4 mr-1" />
                          {job.location_city}
                        </span>
                        <span className="flex items-center text-gray-600">
                          <Clock className="w-4 h-4 mr-1" />
                          {job.shift_timing.charAt(0).toUpperCase() + job.shift_timing.slice(1)} Shift
                        </span>
                        <span className="flex items-center text-gray-600">
                          <Briefcase className="w-4 h-4 mr-1" />
                          {job.role.replace('_', ' ').charAt(0).toUpperCase() + job.role.slice(1)}
                        </span>
                      </div>
                      <p className="text-gray-700 mb-4">{job.description}</p>
                      <div className="flex items-center space-x-4">
                        <span className="text-lg font-bold text-green-600">
                          ₹{job.wage_min.toLocaleString()} - ₹{job.wage_max.toLocaleString()}/month
                        </span>
                      </div>
                    </div>
                    <Button 
                      data-testid={`apply-btn-${job.id}`}
                      onClick={() => applyForJob(job.id)}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      Apply Now
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
            {jobs.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                No jobs found. Try adjusting your filters.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// Worker Applications
const WorkerApplicationsPage = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const response = await axios.get(`${API}/workers/applications`);
      setApplications(response.data);
    } catch (error) {
      toast.error("Failed to load applications");
    } finally {
      setLoading(false);
    }
  };

  const getStatusClass = (status) => {
    const classes = {
      applied: "status-applied",
      shortlisted: "status-shortlisted",
      interview: "status-interview",
      offered: "status-offered",
      accepted: "status-accepted",
      rejected: "status-rejected"
    };
    return classes[status] || "status-applied";
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <WorkerNav />
      
      <div className="max-w-7xl mx-auto px-6 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">My Applications</h1>

        {loading ? (
          <div className="text-center py-12">Loading applications...</div>
        ) : (
          <div className="grid gap-6">
            {applications.map((app) => (
              <Card key={app.id} data-testid={`application-card-${app.id}`}>
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-xl font-semibold text-gray-900">
                          {app.job_details?.title || "Job Title"}
                        </h3>
                        <span className={`status-badge ${getStatusClass(app.status)}`}>
                          {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                        </span>
                      </div>
                      <p className="text-lg text-blue-600 font-medium mb-2">
                        {app.job_details?.restaurant_name}
                      </p>
                      <div className="flex flex-wrap gap-3 text-gray-600">
                        <span className="flex items-center">
                          <MapPin className="w-4 h-4 mr-1" />
                          {app.job_details?.location_city}
                        </span>
                        <span className="flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          Applied {new Date(app.applied_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            {applications.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                You haven't applied to any jobs yet.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// Worker Profile
const WorkerProfilePage = () => {
  const [profile, setProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    location_city: "",
    experience_years: 0,
    preferred_roles: [],
    preferred_shifts: [],
    languages: [],
    availability: "immediate",
    skills: []
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await axios.get(`${API}/workers/profile`);
      setProfile(response.data);
      setFormData(response.data);
      setIsEditing(false);
    } catch (error) {
      if (error.response?.status === 404) {
        setIsEditing(true);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (profile) {
        await axios.put(`${API}/workers/profile`, formData);
        toast.success("Profile updated successfully!");
      } else {
        await axios.post(`${API}/workers/profile`, formData);
        toast.success("Profile created successfully!");
      }
      fetchProfile();
    } catch (error) {
      toast.error("Failed to save profile");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <WorkerNav />
      
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
          {profile && !isEditing && (
            <Button 
              data-testid="edit-profile-btn"
              onClick={() => setIsEditing(true)}
              variant="outline"
            >
              Edit Profile
            </Button>
          )}
        </div>

        <Card>
          <CardContent className="pt-6">
            {!isEditing && profile ? (
              <div className="space-y-4">
                <div>
                  <Label className="text-gray-500">Location</Label>
                  <p className="text-lg">{profile.location_city}</p>
                </div>
                <div>
                  <Label className="text-gray-500">Experience</Label>
                  <p className="text-lg">{profile.experience_years} years</p>
                </div>
                <div>
                  <Label className="text-gray-500">Preferred Roles</Label>
                  <p className="text-lg">{profile.preferred_roles.join(", ")}</p>
                </div>
                <div>
                  <Label className="text-gray-500">Preferred Shifts</Label>
                  <p className="text-lg">{profile.preferred_shifts.join(", ")}</p>
                </div>
                <div>
                  <Label className="text-gray-500">Languages</Label>
                  <p className="text-lg">{profile.languages.join(", ")}</p>
                </div>
                <div>
                  <Label className="text-gray-500">Availability</Label>
                  <p className="text-lg">{profile.availability}</p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Label>Location (City)</Label>
                  <Input 
                    data-testid="location-input"
                    value={formData.location_city}
                    onChange={(e) => setFormData({...formData, location_city: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label>Experience (Years)</Label>
                  <Input 
                    data-testid="experience-input"
                    type="number"
                    value={formData.experience_years}
                    onChange={(e) => setFormData({...formData, experience_years: parseInt(e.target.value)})}
                    required
                  />
                </div>
                <div>
                  <Label>Preferred Roles</Label>
                  <div className="space-y-2">
                    {["barista", "waiter", "counter_staff"].map(role => (
                      <div key={role} className="flex items-center">
                        <Checkbox 
                          data-testid={`role-${role}`}
                          checked={formData.preferred_roles.includes(role)}
                          onCheckedChange={(checked) => {
                            const roles = checked 
                              ? [...formData.preferred_roles, role]
                              : formData.preferred_roles.filter(r => r !== role);
                            setFormData({...formData, preferred_roles: roles});
                          }}
                        />
                        <label className="ml-2">{role.replace('_', ' ').toUpperCase()}</label>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <Label>Preferred Shifts</Label>
                  <div className="space-y-2">
                    {["morning", "evening", "night"].map(shift => (
                      <div key={shift} className="flex items-center">
                        <Checkbox 
                          data-testid={`shift-${shift}`}
                          checked={formData.preferred_shifts.includes(shift)}
                          onCheckedChange={(checked) => {
                            const shifts = checked 
                              ? [...formData.preferred_shifts, shift]
                              : formData.preferred_shifts.filter(s => s !== shift);
                            setFormData({...formData, preferred_shifts: shifts});
                          }}
                        />
                        <label className="ml-2">{shift.toUpperCase()}</label>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <Label>Languages (comma-separated)</Label>
                  <Input 
                    data-testid="languages-input"
                    value={formData.languages.join(", ")}
                    onChange={(e) => setFormData({...formData, languages: e.target.value.split(",").map(l => l.trim())})}
                    placeholder="Hindi, English"
                  />
                </div>
                <div>
                  <Label>Availability</Label>
                  <Select 
                    value={formData.availability}
                    onValueChange={(v) => setFormData({...formData, availability: v})}
                  >
                    <SelectTrigger data-testid="availability-select">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="immediate">Immediate</SelectItem>
                      <SelectItem value="within_week">Within a Week</SelectItem>
                      <SelectItem value="within_month">Within a Month</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex space-x-4">
                  <Button 
                    data-testid="save-profile-btn"
                    type="submit" 
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Save Profile
                  </Button>
                  {profile && (
                    <Button 
                      data-testid="cancel-edit-btn"
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setIsEditing(false);
                        setFormData(profile);
                      }}
                    >
                      Cancel
                    </Button>
                  )}
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// Worker Navigation
const WorkerNav = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Briefcase className="w-6 h-6 text-blue-600" />
            <span className="text-xl font-bold text-gray-900">HospitalityHub</span>
          </div>
          <div className="flex items-center space-x-6">
            <button 
              data-testid="nav-jobs"
              onClick={() => navigate("/worker/jobs")}
              className="text-gray-700 hover:text-blue-600 font-medium"
            >
              Jobs
            </button>
            <button 
              data-testid="nav-applications"
              onClick={() => navigate("/worker/applications")}
              className="text-gray-700 hover:text-blue-600 font-medium"
            >
              My Applications
            </button>
            <button 
              data-testid="nav-profile"
              onClick={() => navigate("/worker/profile")}
              className="text-gray-700 hover:text-blue-600 font-medium"
            >
              Profile
            </button>
            <Button 
              data-testid="logout-btn"
              onClick={() => {
                logout();
                navigate("/");
              }}
              variant="outline"
            >
              Logout
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

// Restaurant Dashboard
const RestaurantDashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const response = await axios.get(`${API}/restaurants/analytics`);
      setAnalytics(response.data);
    } catch (error) {
      toast.error("Failed to load analytics");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <RestaurantNav />
      
      <div className="max-w-7xl mx-auto px-6 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Dashboard</h1>

        {loading ? (
          <div className="text-center py-12">Loading analytics...</div>
        ) : analytics ? (
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Total Jobs</p>
                    <p className="text-3xl font-bold text-gray-900">{analytics.total_jobs}</p>
                  </div>
                  <Briefcase className="w-10 h-10 text-blue-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Total Applications</p>
                    <p className="text-3xl font-bold text-gray-900">{analytics.total_applications}</p>
                  </div>
                  <Users className="w-10 h-10 text-green-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Average Rating</p>
                    <p className="text-3xl font-bold text-gray-900">{analytics.average_rating}/5</p>
                  </div>
                  <Star className="w-10 h-10 text-yellow-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Total Reviews</p>
                    <p className="text-3xl font-bold text-gray-900">{analytics.total_reviews}</p>
                  </div>
                  <FileText className="w-10 h-10 text-purple-600" />
                </div>
              </CardContent>
            </Card>
          </div>
        ) : null}

        <Card>
          <CardHeader>
            <CardTitle>Applications by Status</CardTitle>
          </CardHeader>
          <CardContent>
            {analytics && analytics.applications_by_status ? (
              <div className="space-y-3">
                {Object.entries(analytics.applications_by_status).map(([status, count]) => (
                  <div key={status} className="flex justify-between items-center">
                    <span className="font-medium capitalize">{status}</span>
                    <span className="text-2xl font-bold text-blue-600">{count}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No application data available</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// Restaurant Jobs
const RestaurantJobsPage = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    role: "waiter",
    location_city: "",
    shift_timing: "morning",
    experience_required: "entry",
    wage_min: 15000,
    wage_max: 25000,
    description: "",
    requirements: [],
    benefits: []
  });
  const navigate = useNavigate();

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const response = await axios.get(`${API}/restaurants/jobs`);
      setJobs(response.data);
    } catch (error) {
      toast.error("Failed to load jobs");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API}/jobs`, formData);
      toast.success("Job posted successfully!");
      setShowCreateForm(false);
      fetchJobs();
    } catch (error) {
      toast.error(error.response?.data?.detail || "Failed to post job");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <RestaurantNav />
      
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Job Postings</h1>
          <Button 
            data-testid="create-job-btn"
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="w-5 h-5 mr-2" />
            Post New Job
          </Button>
        </div>

        {showCreateForm && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Create Job Posting</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label>Job Title</Label>
                    <Input 
                      data-testid="job-title-input"
                      value={formData.title}
                      onChange={(e) => setFormData({...formData, title: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <Label>Role</Label>
                    <Select value={formData.role} onValueChange={(v) => setFormData({...formData, role: v})}>
                      <SelectTrigger data-testid="job-role-select">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="barista">Barista</SelectItem>
                        <SelectItem value="waiter">Waiter</SelectItem>
                        <SelectItem value="counter_staff">Counter Staff</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Location (City)</Label>
                    <Input 
                      data-testid="job-location-input"
                      value={formData.location_city}
                      onChange={(e) => setFormData({...formData, location_city: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <Label>Shift Timing</Label>
                    <Select value={formData.shift_timing} onValueChange={(v) => setFormData({...formData, shift_timing: v})}>
                      <SelectTrigger data-testid="job-shift-select">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="morning">Morning</SelectItem>
                        <SelectItem value="evening">Evening</SelectItem>
                        <SelectItem value="night">Night</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Experience Required</Label>
                    <Select value={formData.experience_required} onValueChange={(v) => setFormData({...formData, experience_required: v})}>
                      <SelectTrigger data-testid="job-experience-select">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="entry">Entry Level</SelectItem>
                        <SelectItem value="1-2">1-2 Years</SelectItem>
                        <SelectItem value="3-5">3-5 Years</SelectItem>
                        <SelectItem value="5+">5+ Years</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Wage Range (₹/month)</Label>
                    <div className="flex space-x-2">
                      <Input 
                        data-testid="wage-min-input"
                        type="number"
                        placeholder="Min"
                        value={formData.wage_min}
                        onChange={(e) => setFormData({...formData, wage_min: parseFloat(e.target.value)})}
                      />
                      <Input 
                        data-testid="wage-max-input"
                        type="number"
                        placeholder="Max"
                        value={formData.wage_max}
                        onChange={(e) => setFormData({...formData, wage_max: parseFloat(e.target.value)})}
                      />
                    </div>
                  </div>
                </div>
                <div>
                  <Label>Job Description</Label>
                  <textarea 
                    data-testid="job-description-input"
                    className="w-full p-2 border rounded-md min-h-[100px]"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    required
                  />
                </div>
                <div className="flex space-x-4">
                  <Button 
                    data-testid="submit-job-btn"
                    type="submit" 
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Post Job
                  </Button>
                  <Button 
                    data-testid="cancel-job-btn"
                    type="button"
                    variant="outline"
                    onClick={() => setShowCreateForm(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {loading ? (
          <div className="text-center py-12">Loading jobs...</div>
        ) : (
          <div className="grid gap-6">
            {jobs.map((job) => (
              <Card key={job.id} data-testid={`restaurant-job-${job.id}`}>
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">{job.title}</h3>
                      <div className="flex flex-wrap gap-3 mb-3 text-gray-600">
                        <span><MapPin className="w-4 h-4 inline mr-1" />{job.location_city}</span>
                        <span><Clock className="w-4 h-4 inline mr-1" />{job.shift_timing}</span>
                        <span><Briefcase className="w-4 h-4 inline mr-1" />{job.role}</span>
                      </div>
                      <p className="text-gray-700 mb-3">{job.description}</p>
                      <span className="text-lg font-bold text-green-600">
                        ₹{job.wage_min.toLocaleString()} - ₹{job.wage_max.toLocaleString()}/month
                      </span>
                    </div>
                    <Button 
                      data-testid={`view-applicants-btn-${job.id}`}
                      onClick={() => navigate(`/restaurant/applicants/${job.id}`)}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      View Applicants
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
            {jobs.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                No jobs posted yet. Create your first job posting!
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// Restaurant Applicants
const RestaurantApplicantsPage = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const { jobId } = useParams();

  useEffect(() => {
    fetchApplications();
  }, [jobId]);

  const fetchApplications = async () => {
    try {
      const response = await axios.get(`${API}/restaurants/applications/${jobId}`);
      setApplications(response.data);
    } catch (error) {
      toast.error("Failed to load applications");
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (applicationId, status) => {
    try {
      await axios.put(`${API}/restaurants/applications/${applicationId}`, { status });
      toast.success(`Application ${status}!`);
      fetchApplications();
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <RestaurantNav />
      
      <div className="max-w-7xl mx-auto px-6 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Job Applicants</h1>

        {loading ? (
          <div className="text-center py-12">Loading applications...</div>
        ) : (
          <div className="grid gap-6">
            {applications.map((app) => (
              <Card key={app.id} data-testid={`applicant-card-${app.id}`}>
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">{app.worker_name}</h3>
                      {app.worker_profile && (
                        <div className="space-y-2 text-gray-600">
                          <p><MapPin className="w-4 h-4 inline mr-1" />{app.worker_profile.location_city}</p>
                          <p><Briefcase className="w-4 h-4 inline mr-1" />{app.worker_profile.experience_years} years experience</p>
                          <p>Roles: {app.worker_profile.preferred_roles.join(", ")}</p>
                          <p>Languages: {app.worker_profile.languages.join(", ")}</p>
                        </div>
                      )}
                      <p className="text-sm text-gray-500 mt-3">
                        Applied {new Date(app.applied_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex flex-col space-y-2">
                      <Select 
                        value={app.status}
                        onValueChange={(v) => updateStatus(app.id, v)}
                      >
                        <SelectTrigger data-testid={`status-select-${app.id}`} className="w-40">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="applied">Applied</SelectItem>
                          <SelectItem value="shortlisted">Shortlisted</SelectItem>
                          <SelectItem value="interview">Interview</SelectItem>
                          <SelectItem value="offered">Offered</SelectItem>
                          <SelectItem value="accepted">Accepted</SelectItem>
                          <SelectItem value="rejected">Rejected</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            {applications.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                No applications yet for this job.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const { useParams } = require("react-router-dom");

// Restaurant Profile
const RestaurantProfilePage = () => {
  const [profile, setProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    company_name: "",
    number_of_outlets: 1,
    manager_name: "",
    location_cities: [],
    description: ""
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await axios.get(`${API}/restaurants/profile`);
      setProfile(response.data);
      setFormData(response.data);
      setIsEditing(false);
    } catch (error) {
      if (error.response?.status === 404) {
        setIsEditing(true);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (profile) {
        await axios.put(`${API}/restaurants/profile`, formData);
        toast.success("Profile updated successfully!");
      } else {
        await axios.post(`${API}/restaurants/profile`, formData);
        toast.success("Profile created successfully!");
      }
      fetchProfile();
    } catch (error) {
      toast.error("Failed to save profile");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <RestaurantNav />
      
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Restaurant Profile</h1>
          {profile && !isEditing && (
            <Button 
              data-testid="edit-restaurant-profile-btn"
              onClick={() => setIsEditing(true)}
              variant="outline"
            >
              Edit Profile
            </Button>
          )}
        </div>

        <Card>
          <CardContent className="pt-6">
            {!isEditing && profile ? (
              <div className="space-y-4">
                <div>
                  <Label className="text-gray-500">Company Name</Label>
                  <p className="text-lg">{profile.company_name}</p>
                </div>
                <div>
                  <Label className="text-gray-500">Manager Name</Label>
                  <p className="text-lg">{profile.manager_name}</p>
                </div>
                <div>
                  <Label className="text-gray-500">Number of Outlets</Label>
                  <p className="text-lg">{profile.number_of_outlets}</p>
                </div>
                <div>
                  <Label className="text-gray-500">Locations</Label>
                  <p className="text-lg">{profile.location_cities.join(", ")}</p>
                </div>
                <div>
                  <Label className="text-gray-500">Description</Label>
                  <p className="text-lg">{profile.description}</p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Label>Company Name</Label>
                  <Input 
                    data-testid="company-name-input"
                    value={formData.company_name}
                    onChange={(e) => setFormData({...formData, company_name: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label>Manager Name</Label>
                  <Input 
                    data-testid="manager-name-input"
                    value={formData.manager_name}
                    onChange={(e) => setFormData({...formData, manager_name: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label>Number of Outlets</Label>
                  <Input 
                    data-testid="outlets-input"
                    type="number"
                    value={formData.number_of_outlets}
                    onChange={(e) => setFormData({...formData, number_of_outlets: parseInt(e.target.value)})}
                    required
                  />
                </div>
                <div>
                  <Label>Location Cities (comma-separated)</Label>
                  <Input 
                    data-testid="cities-input"
                    value={formData.location_cities.join(", ")}
                    onChange={(e) => setFormData({...formData, location_cities: e.target.value.split(",").map(c => c.trim())})}
                    placeholder="Mumbai, Delhi, Bangalore"
                  />
                </div>
                <div>
                  <Label>Description</Label>
                  <textarea 
                    data-testid="description-input"
                    className="w-full p-2 border rounded-md min-h-[100px]"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                  />
                </div>
                <div className="flex space-x-4">
                  <Button 
                    data-testid="save-restaurant-profile-btn"
                    type="submit" 
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Save Profile
                  </Button>
                  {profile && (
                    <Button 
                      data-testid="cancel-restaurant-edit-btn"
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setIsEditing(false);
                        setFormData(profile);
                      }}
                    >
                      Cancel
                    </Button>
                  )}
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// Restaurant Navigation
const RestaurantNav = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Briefcase className="w-6 h-6 text-blue-600" />
            <span className="text-xl font-bold text-gray-900">HospitalityHub</span>
          </div>
          <div className="flex items-center space-x-6">
            <button 
              data-testid="nav-dashboard"
              onClick={() => navigate("/restaurant/dashboard")}
              className="text-gray-700 hover:text-blue-600 font-medium"
            >
              Dashboard
            </button>
            <button 
              data-testid="nav-jobs-list"
              onClick={() => navigate("/restaurant/jobs")}
              className="text-gray-700 hover:text-blue-600 font-medium"
            >
              Jobs
            </button>
            <button 
              data-testid="nav-restaurant-profile"
              onClick={() => navigate("/restaurant/profile")}
              className="text-gray-700 hover:text-blue-600 font-medium"
            >
              Profile
            </button>
            <Button 
              data-testid="restaurant-logout-btn"
              onClick={() => {
                logout();
                navigate("/");
              }}
              variant="outline"
            >
              Logout
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

// Protected Route
const ProtectedRoute = ({ children, requiredRole }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/" />;
  }

  return children;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<AuthPage />} />
          <Route path="/register" element={<AuthPage />} />
          
          {/* Worker Routes */}
          <Route 
            path="/worker/jobs" 
            element={
              <ProtectedRoute requiredRole="worker">
                <WorkerJobsPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/worker/applications" 
            element={
              <ProtectedRoute requiredRole="worker">
                <WorkerApplicationsPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/worker/profile" 
            element={
              <ProtectedRoute requiredRole="worker">
                <WorkerProfilePage />
              </ProtectedRoute>
            } 
          />
          
          {/* Restaurant Routes */}
          <Route 
            path="/restaurant/dashboard" 
            element={
              <ProtectedRoute requiredRole="restaurant">
                <RestaurantDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/restaurant/jobs" 
            element={
              <ProtectedRoute requiredRole="restaurant">
                <RestaurantJobsPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/restaurant/applicants/:jobId" 
            element={
              <ProtectedRoute requiredRole="restaurant">
                <RestaurantApplicantsPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/restaurant/profile" 
            element={
              <ProtectedRoute requiredRole="restaurant">
                <RestaurantProfilePage />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;