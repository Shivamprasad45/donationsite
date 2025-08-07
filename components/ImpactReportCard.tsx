import Link from 'next/link'
import { Calendar, Users, DollarSign, TrendingUp } from 'lucide-react'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import type { ImpactReport } from '@/types'

interface ImpactReportCardProps {
  report: ImpactReport
}

export function ImpactReportCard({ report }: ImpactReportCardProps) {
  const utilizationPercentage = (report.totalFundsUtilized / report.totalFundsReceived) * 100

  return (
    <Card className="h-full flex flex-col hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg line-clamp-2">{report.title}</CardTitle>
            <p className="text-sm text-gray-600 mt-1">{report.charity.name}</p>
          </div>
          <Badge variant="secondary">
            {new Date(report.publishedAt!).getFullYear()}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="flex-1">
        <p className="text-gray-700 text-sm line-clamp-3 mb-4">
          {report.description}
        </p>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <DollarSign className="h-5 w-5 text-blue-600 mx-auto mb-1" />
            <p className="text-sm font-medium text-blue-900">Funds Received</p>
            <p className="text-lg font-bold text-blue-600">
              ${report.totalFundsReceived.toLocaleString()}
            </p>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <Users className="h-5 w-5 text-green-600 mx-auto mb-1" />
            <p className="text-sm font-medium text-green-900">Beneficiaries</p>
            <p className="text-lg font-bold text-green-600">
              {report.beneficiariesReached.toLocaleString()}
            </p>
          </div>
        </div>

        <div className="mb-4">
          <div className="flex justify-between text-sm mb-1">
            <span className="font-medium">Fund Utilization</span>
            <span className="text-gray-600">
              ${report.totalFundsUtilized.toLocaleString()} / ${report.totalFundsReceived.toLocaleString()}
            </span>
          </div>
          <Progress value={utilizationPercentage} className="h-2" />
          <p className="text-xs text-gray-600 mt-1">
            {utilizationPercentage.toFixed(1)}% utilized
          </p>
        </div>

        <div className="flex items-center text-sm text-gray-600">
          <Calendar className="h-4 w-4 mr-1" />
          <span>
            {new Date(report.reportPeriod.startDate).toLocaleDateString()} - {' '}
            {new Date(report.reportPeriod.endDate).toLocaleDateString()}
          </span>
        </div>
      </CardContent>

      <CardFooter>
        <Link href={`/impact-reports/${report.id}`} className="w-full">
          <Button variant="outline" className="w-full">
            View Full Report
          </Button>
        </Link>
      </CardFooter>
    </Card>
  )
}
