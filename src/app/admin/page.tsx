import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Settings } from 'lucide-react';

export default function AdminPage() {
  return (
    <div className="flex flex-1 flex-col p-4 md:p-6 lg:p-8">
      <Card className="w-full max-w-4xl mx-auto shadow-lg">
        <CardHeader className="flex flex-row items-center gap-4 border-b pb-4">
          <Settings className="h-8 w-8 text-primary" />
          <div>
            <CardTitle className="text-2xl">Administration Panel</CardTitle>
            <CardDescription>Manage marketplace settings and data.</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <p className="text-muted-foreground">
            Welcome to the administration area. Here you can configure marketplace options, manage listings, users, and view analytics.
          </p>
          {/* Placeholder for future admin components/sections */}
          <div className="mt-6 space-y-4">
            <h3 className="text-lg font-semibold">Admin Sections (Coming Soon)</h3>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li>Marketplace Settings</li>
              <li>Listing Management</li>
              <li>User Management</li>
              <li>Analytics Dashboard</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
