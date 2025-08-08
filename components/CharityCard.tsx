import Link from "next/link";
import { MapPin, Users, Target, Star } from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import type { Charity } from "@/types";

interface CharityCardProps {
  charity: Charity;
}

export function CharityCard({ charity }: CharityCardProps) {
  const activeGoal = charity.goals?.find((goal) => goal.isActive);
  const progressPercentage = activeGoal
    ? (activeGoal.currentAmount / activeGoal.targetAmount) * 100
    : 0;

  return (
    <Card className="h-full flex flex-col hover:shadow-lg transition-shadow">
      <div className="relative">
        <img
          src={
            charity.logo ||
            `https://picsum.photos/seed/${Math.floor(Math.random() * 200)}/600/400`
          }
          alt={charity.name}
          className="w-full h-48 object-cover rounded-t-lg"
        />
        <Badge className="absolute top-2 right-2" variant="secondary">
          {charity.category}
        </Badge>
      </div>

      <CardContent className="flex-1 p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-semibold text-lg line-clamp-2">{charity.name}</h3>
          <div className="flex items-center space-x-1 text-sm text-yellow-600">
            <Star className="h-4 w-4 fill-current" />
            <span>{charity.rating.toFixed(1)}</span>
          </div>
        </div>

        <div className="flex items-center text-sm text-gray-600 mb-2">
          <MapPin className="h-4 w-4 mr-1" />
          <span>
            {charity.location?.city}, {charity.location?.state}
          </span>
        </div>

        <p className="text-gray-700 text-sm line-clamp-3 mb-4">
          {charity.description}
        </p>

        {activeGoal && (
          <div className="mb-4">
            <div className="flex justify-between text-sm mb-1">
              <span className="font-medium">{activeGoal.title}</span>
              <span className="text-gray-600">
                ${activeGoal.currentAmount.toLocaleString()} / $
                {activeGoal.targetAmount.toLocaleString()}
              </span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </div>
        )}

        <div className="flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center">
            <Users className="h-4 w-4 mr-1" />
            <span>{charity.donorCount} donors</span>
          </div>
          <div className="flex items-center">
            <Target className="h-4 w-4 mr-1" />
            <span>${charity.totalReceived.toLocaleString()} raised</span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0">
        <Link href={`/charities/${charity._id}`} className="w-full">
          <Button className="w-full">View Details & Donate</Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
