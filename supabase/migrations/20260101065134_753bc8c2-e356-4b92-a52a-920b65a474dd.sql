-- Create enum for professions
CREATE TYPE public.profession_type AS ENUM ('speech_therapy', 'physiotherapy', 'occupational_therapy');

-- Create enum for appointment status
CREATE TYPE public.appointment_status AS ENUM ('pending', 'confirmed', 'completed', 'cancelled');

-- Create enum for age range
CREATE TYPE public.age_range AS ENUM ('infant', 'toddler', 'child_young', 'child_old', 'teen', 'adult', 'senior');

-- Create profiles table for user data
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  phone TEXT,
  user_type TEXT NOT NULL CHECK (user_type IN ('therapist', 'parent')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create therapists table
CREATE TABLE public.therapists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  profession profession_type NOT NULL,
  license_number TEXT,
  years_experience INTEGER DEFAULT 0,
  bio TEXT,
  avatar_url TEXT,
  
  -- Location
  address TEXT,
  city TEXT NOT NULL,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  
  -- Services
  home_visits BOOLEAN DEFAULT false,
  home_visits_radius_km INTEGER,
  specializations TEXT[] DEFAULT '{}',
  
  -- Pricing
  session_duration_minutes INTEGER DEFAULT 45,
  accepts_btl BOOLEAN DEFAULT false,
  health_funds TEXT[] DEFAULT '{}',
  
  -- Features
  instant_booking BOOLEAN DEFAULT false,
  available_today BOOLEAN DEFAULT false,
  
  -- Ratings
  rating_average DECIMAL(3, 2) DEFAULT 0.00,
  rating_count INTEGER DEFAULT 0,
  
  -- Status
  is_verified BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create availability table (weekly schedule template)
CREATE TABLE public.availability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  therapist_id UUID REFERENCES public.therapists(id) ON DELETE CASCADE NOT NULL,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  UNIQUE(therapist_id, day_of_week, start_time)
);

-- Create appointments table
CREATE TABLE public.appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  therapist_id UUID REFERENCES public.therapists(id) ON DELETE CASCADE NOT NULL,
  parent_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  
  -- Patient info (minimal, non-medical)
  patient_first_name TEXT NOT NULL,
  patient_age_range age_range NOT NULL,
  
  -- Appointment details
  appointment_date DATE NOT NULL,
  appointment_time TIME NOT NULL,
  duration_minutes INTEGER DEFAULT 45,
  
  -- Status
  status appointment_status DEFAULT 'pending',
  
  -- Non-medical notes
  coordination_notes TEXT,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  confirmed_at TIMESTAMP WITH TIME ZONE,
  cancelled_at TIMESTAMP WITH TIME ZONE,
  cancellation_reason TEXT,
  cancelled_by TEXT CHECK (cancelled_by IN ('therapist', 'parent'))
);

-- Create reviews table
CREATE TABLE public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  therapist_id UUID REFERENCES public.therapists(id) ON DELETE CASCADE NOT NULL,
  parent_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  appointment_id UUID REFERENCES public.appointments(id),
  
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,
  would_recommend BOOLEAN,
  
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.therapists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Therapists policies (public read, owner write)
CREATE POLICY "Anyone can view active therapists"
  ON public.therapists FOR SELECT
  USING (is_active = true);

CREATE POLICY "Therapists can update their own profile"
  ON public.therapists FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Therapists can insert their own profile"
  ON public.therapists FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Availability policies
CREATE POLICY "Anyone can view active availability"
  ON public.availability FOR SELECT
  USING (is_active = true);

CREATE POLICY "Therapists can manage their own availability"
  ON public.availability FOR ALL
  USING (
    therapist_id IN (
      SELECT id FROM public.therapists WHERE user_id = auth.uid()
    )
  );

-- Appointments policies
CREATE POLICY "Parents can view their own appointments"
  ON public.appointments FOR SELECT
  USING (auth.uid() = parent_id);

CREATE POLICY "Therapists can view their appointments"
  ON public.appointments FOR SELECT
  USING (
    therapist_id IN (
      SELECT id FROM public.therapists WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Parents can create appointments"
  ON public.appointments FOR INSERT
  WITH CHECK (auth.uid() = parent_id);

CREATE POLICY "Parents can update their own appointments"
  ON public.appointments FOR UPDATE
  USING (auth.uid() = parent_id);

CREATE POLICY "Therapists can update their appointments"
  ON public.appointments FOR UPDATE
  USING (
    therapist_id IN (
      SELECT id FROM public.therapists WHERE user_id = auth.uid()
    )
  );

-- Reviews policies
CREATE POLICY "Anyone can view reviews"
  ON public.reviews FOR SELECT
  USING (true);

CREATE POLICY "Parents can create reviews for their appointments"
  ON public.reviews FOR INSERT
  WITH CHECK (auth.uid() = parent_id);

-- Create function to handle new user profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, user_type)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', ''),
    COALESCE(NEW.raw_user_meta_data ->> 'user_type', 'parent')
  );
  RETURN NEW;
END;
$$;

-- Trigger to create profile on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_therapists_updated_at
  BEFORE UPDATE ON public.therapists
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to update therapist rating
CREATE OR REPLACE FUNCTION public.update_therapist_rating()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  UPDATE public.therapists
  SET 
    rating_average = (
      SELECT COALESCE(AVG(rating)::DECIMAL(3,2), 0.00)
      FROM public.reviews
      WHERE therapist_id = NEW.therapist_id
    ),
    rating_count = (
      SELECT COUNT(*)
      FROM public.reviews
      WHERE therapist_id = NEW.therapist_id
    )
  WHERE id = NEW.therapist_id;
  
  RETURN NEW;
END;
$$;

-- Trigger to update rating when review is added
CREATE TRIGGER on_review_created
  AFTER INSERT ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION public.update_therapist_rating();