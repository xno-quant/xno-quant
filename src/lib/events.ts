
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';
import { format, isToday } from 'date-fns';

export interface Experience {
  year: string;
  role: string;
  description: string;
}

export interface Speaker {
  id: string;
  name: string;
  title: string;
  avatar: string;
  summary: string;
  bio: string;
  expertise: string[];
  experience: Experience[];
  quote: string;
  socials?: {
    twitter?: string;
    linkedin?: string;
    googleScholar?: string;
    github?: string;
    website?: string;
  };
  event_id?: string;
  events?: Event[];
  position?: number;
  companyLogo?: string;
}

export interface ScheduleItem {
  time: string;
  title: string;
  description: string;
}

export interface Event {
  id: string;
  title: string;
  tagline: string;
  date: string;
  formattedDate: string;
  location: string;
  description: string;
  image: string;
  aboutImage?: string;
  imageAfter?: string;
  speakers: Speaker[];
  schedule: ScheduleItem[];
  isPast: boolean;
  contentHtml?: string;
  mapLink?: string;
  order?: number;
  recap?: string;
  gallery?: string[];
  type?: string;
  format?: 'Online' | 'Offline';
  duration?: number;
  enableCalendar?: boolean;
  slideUrl?: string;
  videoUrl?: string;
}

const contentDirectory = path.join(process.cwd(), 'content');
const eventsDirectory = path.join(contentDirectory, 'events');
const speakersDirectory = path.join(contentDirectory, 'speakers');

// Function to generate a clean slug
const generateSlug = (fileName: string): string => {
  return fileName.replace(/\.md$/, '').replace(/^\d+-/, '');
};

async function processMarkdown(content: string): Promise<string> {
  const processedContent = await remark().use(html).process(content);
  return processedContent.toString();
}

export async function getSpeakerById(id: string): Promise<Speaker | undefined> {
  const fullPath = path.join(speakersDirectory, `${id}.md`);
  if (!fs.existsSync(fullPath)) {
    return undefined;
  }
  const fileContents = fs.readFileSync(fullPath, 'utf8');
  const matterResult = matter(fileContents);
  const bioHtml = await processMarkdown(matterResult.data.bio || '');

  return {
    id,
    ...(matterResult.data as Omit<Speaker, 'id' | 'bio'>),
    bio: bioHtml,
  };
}

async function getEventData(fileName: string): Promise<Event> {
  const id = generateSlug(fileName);
  const fullPath = path.join(eventsDirectory, fileName);
  const fileContents = fs.readFileSync(fullPath, 'utf8');
  const matterResult = matter(fileContents);

  const contentHtml = await processMarkdown(matterResult.content);

  const eventData = matterResult.data as Omit<Event, 'id' | 'speakers' | 'description' | 'isPast' | 'formattedDate'> & {
    speakers: string[];
  };

  const speakers = (await Promise.all(
    (eventData.speakers || [])
      .map(async speakerId => await getSpeakerById(speakerId))
  )).filter((s): s is Speaker => s !== undefined)
    .map(speaker => ({ ...speaker, event_id: id }));

  // Parse date and determine if it's in the past
  const eventDate = new Date(eventData.date);
  const now = new Date();
  const isPast = eventDate < now;
  const formattedDate = format(eventDate, 'dd/MM/yyyy');

  let recapHtml = '';
  if (eventData.recap) {
    recapHtml = await processMarkdown(eventData.recap);
  }

  return {
    id,
    ...eventData,
    description: contentHtml,
    speakers,
    schedule: eventData.schedule || [],
    isPast: isPast,
    formattedDate: formattedDate,
    recap: recapHtml,
    // Provide default values for new fields if they don't exist
    type: eventData.type || 'Workshop',
    format: eventData.format || 'Offline',
    duration: eventData.duration || 120,
    enableCalendar: eventData.enableCalendar || false,
    slideUrl: eventData.slideUrl,
    videoUrl: eventData.videoUrl,
  };
}

export async function getAllEvents(): Promise<Event[]> {
  const fileNames = fs.readdirSync(eventsDirectory);
  const allEventsData = await Promise.all(fileNames.map(getEventData));

  // Sort by order descending (3, 2, 1...)
  return allEventsData.sort((a, b) => {
    return (b.order || 0) - (a.order || 0);
  });
}

export async function getTodaysEvents(): Promise<Event[]> {
  const allEvents = await getAllEvents();
  return allEvents.filter(event => isToday(new Date(event.date)));
}

export async function getAllSpeakers(): Promise<Speaker[]> {
  const speakerIds = fs.readdirSync(speakersDirectory).map(file => file.replace(/\.md$/, ''));
  const allSpeakers = (await Promise.all(
    speakerIds.map(id => getSpeakerById(id))
  )).filter((s): s is Speaker => !!s);

  // Sort by position ascending (1, 2, 3...)
  return allSpeakers.sort((a, b) => (a.position || 99) - (b.position || 99));
}

export async function getSpeakerWithEvents(speakerId: string): Promise<Speaker | null> {
  const speaker = await getSpeakerById(speakerId);
  if (!speaker) return null;

  const allEvents = await getAllEvents();
  const speakerEvents = allEvents.filter(event =>
    event.speakers.some(s => s.id === speakerId)
  );

  return {
    ...speaker,
    events: speakerEvents,
  };
}


export async function getPastSpeakers(): Promise<Speaker[]> {
  const allEvents = await getAllEvents();
  const pastEvents = allEvents.filter(event => event.isPast);

  const speakerMap = new Map<string, Speaker>();

  // Sort past events by order descending to prioritize most recent first
  pastEvents.sort((a, b) => (b.order || 0) - (a.order || 0));

  // Collect all speakers from past events
  pastEvents.forEach(event => {
    event.speakers.forEach(speaker => {
      if (!speakerMap.has(speaker.id)) {
        speakerMap.set(speaker.id, { ...speaker, event_id: event.id });
      }
    });
  });

  const allPastSpeakers = Array.from(speakerMap.values());

  // Show all past speakers - don't filter out any
  // The intention is to show speakers from previous events as "notable past speakers"

  // Sort by position ascending (1, 2, 3...)
  return allPastSpeakers.sort((a, b) => (a.position || 99) - (b.position || 99));
}


export async function getEventById(id: string): Promise<Event | undefined> {
  const fileNames = fs.readdirSync(eventsDirectory);
  const fileName = fileNames.find(file => generateSlug(file) === id);
  if (!fileName) {
    return undefined;
  }
  return getEventData(fileName);
}

export async function getLatestEvent(): Promise<Event | undefined> {
  const allEvents = await getAllEvents();
  // Find the event with the highest order that is not in the past
  const upcomingEvents = allEvents.filter(event => !event.isPast);
  if (upcomingEvents.length > 0) {
    // Sort by order descending to get the highest order number first
    return upcomingEvents.sort((a, b) => (b.order || 0) - (a.order || 0))[0];
  }
  // If no upcoming events, return the most recent event (highest order number)
  // Sort all events by order and return the first one
  return allEvents.sort((a, b) => (b.order || 0) - (a.order || 0))[0];
}

export function getAllSpeakerIds() {
  const fileNames = fs.readdirSync(speakersDirectory);
  return fileNames.map(fileName => {
    return {
      speakerId: fileName.replace(/\.md$/, '')
    }
  })
}

export function getAllEventIds() {
  const fileNames = fs.readdirSync(eventsDirectory);
  return fileNames.map(fileName => {
    return {
      slug: generateSlug(fileName)
    }
  })
}
