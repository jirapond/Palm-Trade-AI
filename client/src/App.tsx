import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ThemeProvider";
import { FactoryAuthProvider } from "@/contexts/FactoryAuthContext";
import { AdminAuthProvider } from "@/contexts/AdminAuthContext";
import { TopNav } from "@/components/TopNav";
import HomePage from "@/pages/HomePage";
import FactoriesPage from "@/pages/FactoriesPage";
import FactoryDetailPage from "@/pages/FactoryDetailPage";
import ChatPage from "@/pages/ChatPage";
import MessagesPage from "@/pages/MessagesPage";
import ProfilePage from "@/pages/ProfilePage";
import MapPage from "@/pages/MapPage";
import PurchaseMapPage from "@/pages/PurchaseMapPage";
import LocationDetailPage from "@/pages/LocationDetailPage";
import FactoryRegisterPage from "@/pages/FactoryRegisterPage";
import FactoryLoginPage from "@/pages/FactoryLoginPage";
import FactoryProfilePage from "@/pages/FactoryProfilePage";
import AdminLoginPage from "@/pages/AdminLoginPage";
import AdminDashboardPage from "@/pages/AdminDashboardPage";
import QueuePalmPage from "@/pages/QueuePalmPage";
import PalmInfoPage from "@/pages/PalmInfoPage";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/queue-palm" component={QueuePalmPage} />
      <Route path="/factories" component={FactoriesPage} />
      <Route path="/factory/register" component={FactoryRegisterPage} />
      <Route path="/factory/login" component={FactoryLoginPage} />
      <Route path="/factory/profile" component={FactoryProfilePage} />
      <Route path="/factory/:id" component={FactoryDetailPage} />
      <Route path="/admin/login" component={AdminLoginPage} />
      <Route path="/admin" component={AdminDashboardPage} />
      <Route path="/chat/:id" component={ChatPage} />
      <Route path="/messages" component={MessagesPage} />
      <Route path="/profile" component={ProfilePage} />
      <Route path="/map" component={MapPage} />
      <Route path="/purchase-map" component={PurchaseMapPage} />
      <Route path="/location/:id" component={LocationDetailPage} />
      <Route path="/palm-info" component={PalmInfoPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <FactoryAuthProvider>
          <AdminAuthProvider>
            <TooltipProvider>
              <div className="min-h-screen bg-background flex flex-col">
                <TopNav />
                <main className="flex-1">
                  <Router />
                </main>
              </div>
              <Toaster />
            </TooltipProvider>
          </AdminAuthProvider>
        </FactoryAuthProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
