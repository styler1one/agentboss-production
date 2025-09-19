'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { FileUpload } from '@/components/ui/file-upload'

export default function ExpertProfileSetup() {
  const { data: session, update } = useSession()
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    bio: '',
    expertise: '',
    yearsExperience: '',
    hourlyRate: '',
    location: '',
    phone: '',
    website: '',
    linkedIn: ''
  })

  const [selectedSkills, setSelectedSkills] = useState<Array<{
    name: string
    category: string
    proficiency: number
  }>>([])
  
  const [uploadedFiles, setUploadedFiles] = useState<Array<{
    url: string
    filename: string
    type: string
  }>>([])

  const skillCategories = [
    {
      name: 'AI & Machine Learning',
      skills: ['TensorFlow', 'PyTorch', 'Scikit-learn', 'OpenAI API', 'Hugging Face', 'Computer Vision', 'NLP', 'Deep Learning']
    },
    {
      name: 'Programming Languages',
      skills: ['Python', 'JavaScript', 'TypeScript', 'Java', 'C++', 'R', 'Go', 'Rust']
    },
    {
      name: 'Web Development',
      skills: ['React', 'Next.js', 'Vue.js', 'Node.js', 'Express', 'Django', 'FastAPI', 'GraphQL']
    },
    {
      name: 'Data Science',
      skills: ['Pandas', 'NumPy', 'Matplotlib', 'Jupyter', 'SQL', 'MongoDB', 'PostgreSQL', 'Data Visualization']
    },
    {
      name: 'Cloud & DevOps',
      skills: ['AWS', 'Azure', 'Google Cloud', 'Docker', 'Kubernetes', 'CI/CD', 'Terraform', 'Jenkins']
    },
    {
      name: 'Business & Strategy',
      skills: ['Project Management', 'Agile', 'Scrum', 'Business Analysis', 'Strategy', 'Consulting', 'Training', 'Workshops']
    }
  ]

  const experienceLevels = [
    '0-1 years',
    '1-3 years', 
    '3-5 years',
    '5-10 years',
    '10+ years'
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/expert/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          skills: selectedSkills
        }),
      })

      if (response.ok) {
        toast({
          title: "Profile Created",
          description: "Your expert profile has been created successfully.",
        })
        // Force page reload to refresh session
        window.location.href = '/dashboard'
      } else {
        const error = await response.json()
        console.error('API Error:', error)
        toast({
          title: "Profile Creation Failed",
          description: error.message || error.error || "Failed to create profile. Please try again.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Profile setup error:', error)
      toast({
        title: "Profile Setup Failed",
        description: "An error occurred while setting up your profile. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData({
      ...formData,
      [name]: value
    })
  }

  const addSkill = (skillName: string, category: string) => {
    if (!selectedSkills.find(s => s.name === skillName)) {
      setSelectedSkills([...selectedSkills, {
        name: skillName,
        category,
        proficiency: 3 // Default to intermediate
      }])
    }
  }

  const removeSkill = (skillName: string) => {
    setSelectedSkills(selectedSkills.filter(s => s.name !== skillName))
  }

  const updateSkillProficiency = (skillName: string, proficiency: number) => {
    setSelectedSkills(selectedSkills.map(s => 
      s.name === skillName ? { ...s, proficiency } : s
    ))
  }

  const getProficiencyLabel = (level: number) => {
    const labels = ['Beginner', 'Basic', 'Intermediate', 'Advanced', 'Expert']
    return labels[level - 1] || 'Intermediate'
  }

  const handleFileUpload = (url: string, filename: string) => {
    const fileType = filename.split('.').pop()?.toLowerCase() || ''
    setUploadedFiles(prev => [...prev, {
      url,
      filename,
      type: fileType
    }])
    
    toast({
      title: "File Uploaded",
      description: `${filename} has been added to your portfolio.`,
    })
  }

  const removeFile = (filename: string) => {
    setUploadedFiles(prev => prev.filter(file => file.filename !== filename))
    toast({
      title: "File Removed",
      description: "File has been removed from your portfolio.",
    })
  }

  return (
    <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Complete Your Expert Profile</CardTitle>
            <CardDescription>
              Tell us about your expertise and skills to help clients find you.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Personal Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input
                    type="text"
                    name="firstName"
                    id="firstName"
                    required
                    value={formData.firstName}
                    onChange={handleChange}
                    placeholder="Your first name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input
                    type="text"
                    name="lastName"
                    id="lastName"
                    required
                    value={formData.lastName}
                    onChange={handleChange}
                    placeholder="Your last name"
                  />
                </div>
              </div>

              {/* Bio */}
              <div className="space-y-2">
                <Label htmlFor="bio">Professional Bio *</Label>
                <Textarea
                  name="bio"
                  id="bio"
                  required
                  rows={4}
                  value={formData.bio}
                  onChange={handleChange}
                  placeholder="Describe your professional background, expertise, and what makes you unique..."
                />
              </div>

              {/* Expertise & Experience */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="expertise">Primary Expertise *</Label>
                  <Input
                    type="text"
                    name="expertise"
                    id="expertise"
                    required
                    value={formData.expertise}
                    onChange={handleChange}
                    placeholder="e.g., AI/ML Engineer, Data Scientist"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="yearsExperience">Years of Experience *</Label>
                  <Select
                    value={formData.yearsExperience}
                    onValueChange={(value) => handleSelectChange('yearsExperience', value)}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select experience level" />
                    </SelectTrigger>
                    <SelectContent>
                      {experienceLevels.map((level) => (
                        <SelectItem key={level} value={level}>
                          {level}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Skills Matrix */}
              <div className="space-y-4">
                <div>
                  <Label className="text-base font-semibold">Skills & Expertise</Label>
                  <p className="text-sm text-muted-foreground">
                    Select your skills and set your proficiency level (1-5 scale)
                  </p>
                </div>

                {/* Selected Skills */}
                {selectedSkills.length > 0 && (
                  <div className="space-y-3">
                    <Label className="text-sm font-medium">Selected Skills</Label>
                    <div className="grid grid-cols-1 gap-3">
                      {selectedSkills.map((skill) => (
                        <div key={skill.name} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center space-x-3">
                            <Badge variant="secondary">{skill.category}</Badge>
                            <span className="font-medium">{skill.name}</span>
                          </div>
                          <div className="flex items-center space-x-3">
                            <Select
                              value={skill.proficiency.toString()}
                              onValueChange={(value) => updateSkillProficiency(skill.name, parseInt(value))}
                            >
                              <SelectTrigger className="w-32">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {[1, 2, 3, 4, 5].map((level) => (
                                  <SelectItem key={level} value={level.toString()}>
                                    {level} - {getProficiencyLabel(level)}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => removeSkill(skill.name)}
                            >
                              Remove
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Skill Categories */}
                <div className="space-y-4">
                  {skillCategories.map((category) => (
                    <div key={category.name} className="space-y-2">
                      <Label className="text-sm font-medium">{category.name}</Label>
                      <div className="flex flex-wrap gap-2">
                        {category.skills.map((skill) => (
                          <Button
                            key={skill}
                            type="button"
                            variant={selectedSkills.find(s => s.name === skill) ? "default" : "outline"}
                            size="sm"
                            onClick={() => addSkill(skill, category.name)}
                            disabled={!!selectedSkills.find(s => s.name === skill)}
                          >
                            {skill}
                          </Button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Contact Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="hourlyRate">Hourly Rate (€)</Label>
                  <Input
                    type="number"
                    name="hourlyRate"
                    id="hourlyRate"
                    value={formData.hourlyRate}
                    onChange={handleChange}
                    placeholder="150"
                    min="0"
                    step="5"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    type="text"
                    name="location"
                    id="location"
                    value={formData.location}
                    onChange={handleChange}
                    placeholder="Amsterdam, Netherlands"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    type="tel"
                    name="phone"
                    id="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+31 6 12345678"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <Input
                    type="url"
                    name="website"
                    id="website"
                    value={formData.website}
                    onChange={handleChange}
                    placeholder="https://yourwebsite.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="linkedIn">LinkedIn Profile</Label>
                <Input
                  type="url"
                  name="linkedIn"
                  id="linkedIn"
                  value={formData.linkedIn}
                  onChange={handleChange}
                  placeholder="https://linkedin.com/in/yourprofile"
                />
              </div>

              {/* Portfolio & Documents */}
              <div className="space-y-4">
                <div>
                  <Label className="text-base font-semibold">Portfolio & Documents</Label>
                  <p className="text-sm text-muted-foreground">
                    Upload your portfolio, CV, certificates, or other relevant documents
                  </p>
                </div>

                <FileUpload 
                  onUploadComplete={handleFileUpload}
                  multiple={true}
                  className="w-full"
                />

                {/* Uploaded Files */}
                {uploadedFiles.length > 0 && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Uploaded Files</Label>
                    <div className="grid grid-cols-1 gap-2">
                      {uploadedFiles.map((file, index) => (
                        <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-primary/10 rounded flex items-center justify-center">
                              {file.type === 'pdf' ? '📄' : 
                               ['jpg', 'jpeg', 'png', 'webp'].includes(file.type) ? '🖼️' : '📎'}
                            </div>
                            <div>
                              <p className="text-sm font-medium">{file.filename.split('/').pop()}</p>
                              <p className="text-xs text-muted-foreground">{file.type.toUpperCase()}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => window.open(file.url, '_blank')}
                            >
                              View
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => removeFile(file.filename)}
                            >
                              Remove
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end space-x-3 pt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push('/dashboard')}
                >
                  Skip for now
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                >
                  {loading ? 'Saving...' : 'Complete Profile'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
