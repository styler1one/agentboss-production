'use client'

import { useState, useEffect } from 'react'
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

export default function ExpertProfileEdit() {
  const { data: session } = useSession()
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [fetchLoading, setFetchLoading] = useState(true)
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

  // Fetch existing profile data
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch('/api/expert/profile')
        if (response.ok) {
          const data = await response.json()
          if (data.profile) {
            setFormData({
              firstName: data.profile.firstName || '',
              lastName: data.profile.lastName || '',
              bio: data.profile.bio || '',
              expertise: data.profile.expertise || '',
              yearsExperience: data.profile.yearsExperience || '',
              hourlyRate: data.profile.hourlyRate || '',
              location: data.profile.location || '',
              phone: data.profile.phone || '',
              website: data.profile.website || '',
              linkedIn: data.profile.linkedIn || ''
            })
            // TODO: Load skills from database when skills system is implemented
          }
        }
      } catch (error) {
        console.error('Error fetching profile:', error)
      } finally {
        setFetchLoading(false)
      }
    }

    if (session?.user?.role === 'EXPERT') {
      fetchProfile()
    }
  }, [session])

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
          title: "Profile Updated",
          description: "Your expert profile has been updated successfully.",
        })
        router.push('/dashboard')
      } else {
        const error = await response.json()
        toast({
          title: "Update Failed",
          description: error.message || "Failed to update profile. Please try again.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Profile update error:', error)
      toast({
        title: "Update Failed",
        description: "An error occurred while updating your profile. Please try again.",
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

  if (fetchLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Edit Expert Profile</CardTitle>
            <CardDescription>
              Update your expertise and skills to help clients find you.
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
                  <Label htmlFor="expertise">Primary Expertise</Label>
                  <Input
                    type="text"
                    name="expertise"
                    id="expertise"
                    value={formData.expertise}
                    onChange={handleChange}
                    placeholder="e.g., AI/ML Engineer, Data Scientist"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="yearsExperience">Years of Experience</Label>
                  <Select
                    value={formData.yearsExperience}
                    onValueChange={(value) => handleSelectChange('yearsExperience', value)}
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

              {/* Skills Matrix - Simplified for edit mode */}
              <div className="space-y-4">
                <div>
                  <Label className="text-base font-semibold">Skills & Expertise</Label>
                  <p className="text-sm text-muted-foreground">
                    Skills management will be enhanced in the next update
                  </p>
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

              {/* Submit Buttons */}
              <div className="flex justify-end space-x-3 pt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push('/dashboard')}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                >
                  {loading ? 'Saving...' : 'Update Profile'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
