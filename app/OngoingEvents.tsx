// src/pages/OngoingEventsPage.tsx
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Clock } from "lucide-react";
import { motion } from "framer-motion";

interface Event {
  eventID: number;
  title: string;
  description: string;
  location: string;
  startDate: string;
  endDate: string;
  pointsAwarded: number;
}

const OngoingEventsPage: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);

  useEffect(() => {
    // Example static data (replace with API call)
    const sampleEvents: Event[] = [
      {
        eventID: 1,
        title: "Beach Cleanup Drive",
        description: "Join us to clean East Coast Beach and earn green points!",
        location: "East Coast Park",
        startDate: "2025-10-20",
        endDate: "2025-10-30",
        pointsAwarded: 50,
      },
      {
        eventID: 2,
        title: "Tree Planting Festival",
        description: "Help plant new trees around your community park.",
        location: "Bukit Timah Park",
        startDate: "2025-09-12",
        endDate: "2025-09-15",
        pointsAwarded: 80,
      },
    ];

    // Filter only ongoing events (endDate >= today)
    const today = new Date();
    const ongoing = sampleEvents.filter(
      (e) => new Date(e.endDate) >= today
    );
    setEvents(ongoing);
  }, []);

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-center">🌱 Ongoing Events</h1>

      {events.length === 0 ? (
        <p className="text-center text-gray-500">No ongoing events at the moment.</p>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <motion.div
              key={event.eventID}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <Card className="shadow-lg hover:shadow-xl transition-all duration-300">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold">{event.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 mb-3">{event.description}</p>
                  <div className="flex items-center text-sm mb-1">
                    <MapPin className="h-4 w-4 mr-2" /> {event.location}
                  </div>
                  <div className="flex items-center text-sm mb-1">
                    <Calendar className="h-4 w-4 mr-2" />
                    {new Date(event.startDate).toLocaleDateString()} -{" "}
                    {new Date(event.endDate).toLocaleDateString()}
                  </div>
                  <div className="flex items-center text-sm mb-3">
                    <Clock className="h-4 w-4 mr-2" /> Earn {event.pointsAwarded} points
                  </div>
                  <Button className="w-full mt-2">View Details</Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OngoingEventsPage;
