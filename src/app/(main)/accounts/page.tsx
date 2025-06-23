import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Landmark, CreditCard, Wallet, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";

const accounts = [
  { name: "Checking Account", type: "Bank", balance: "$4,520.50", icon: <Landmark className="h-8 w-8 text-muted-foreground" /> },
  { name: "Savings Account", type: "Bank", balance: "$10,210.00", icon: <Landmark className="h-8 w-8 text-muted-foreground" /> },
  { name: "Main Credit Card", type: "Card", balance: "$-780.25", icon: <CreditCard className="h-8 w-8 text-muted-foreground" /> },
  { name: "Cash Wallet", type: "Cash", balance: "$150.00", icon: <Wallet className="h-8 w-8 text-muted-foreground" /> },
];

export default function AccountsPage() {
  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Accounts</CardTitle>
          <CardDescription>Manage your connected bank accounts, credit cards, and cash.</CardDescription>
        </CardHeader>
      </Card>
      <div className="grid gap-6 md:grid-cols-2">
        {accounts.map((account, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between">
              <div className="flex items-center gap-4">
                {account.icon}
                <div>
                  <CardTitle className="text-xl font-headline">{account.name}</CardTitle>
                  <CardDescription>{account.type}</CardDescription>
                </div>
              </div>
               <Button variant="ghost" size="icon">
                  <MoreVertical className="h-5 w-5" />
                </Button>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{account.balance}</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
