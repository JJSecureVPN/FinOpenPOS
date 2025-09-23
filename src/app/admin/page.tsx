"use client";
import { useEffect, useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Typography } from "@/components/ui";
import {
  ChartTooltipContent,
  ChartTooltip,
  ChartContainer,
  ChartConfig,
} from "@/components/ui/chart";
import { Loader2Icon, TrendingUp } from "lucide-react";
import {
  Pie,
  PieChart,
  CartesianGrid,
  XAxis,
  Bar,
  BarChart,
  Line,
  LineChart,
} from "recharts";
import { ResponsiveContainer, ResponsiveGrid, ResponsiveCard } from "@/components/responsive";

export default function Page() {
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [totalProfit, setTotalProfit] = useState(0);
  const [totalCreditSales, setTotalCreditSales] = useState(0); // Dinero fiado
  const [cashFlow, setCashFlow] = useState<{ date: string; amount: unknown }[]>([]);
  const [revenueByCategory, setRevenueByCategory] = useState({});
  const [expensesByCategory, setExpensesByCategory] = useState({});
  const [profitMargin, setProfitMargin] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [
          revenueRes,
          expensesRes,
          profitRes,
          creditSalesRes,
          cashFlowRes,
          revenueByCategoryRes,
          expensesByCategoryRes,
          profitMarginRes
        ] = await Promise.all([
          fetch('/api/admin/revenue/total'),
          fetch('/api/admin/expenses/total'),
          fetch('/api/admin/profit/total'),
          fetch('/api/admin/credit-sales/total'), // Nueva API para dinero fiado
          fetch('/api/admin/cashflow'),
          fetch('/api/admin/revenue/category'),
          fetch('/api/admin/expenses/category'),
          fetch('/api/admin/profit/margin')
        ]);

        const revenue = revenueRes.ok ? await revenueRes.json() : {};
        const expenses = expensesRes.ok ? await expensesRes.json() : {};
        const profit = profitRes.ok ? await profitRes.json() : {};
        const creditSales = creditSalesRes.ok ? await creditSalesRes.json() : {};
        const cashFlowData = cashFlowRes.ok ? await cashFlowRes.json() : {};
        const revenueByCategoryData = revenueByCategoryRes.ok ? await revenueByCategoryRes.json() : {};
        const expensesByCategoryData = expensesByCategoryRes.ok ? await expensesByCategoryRes.json() : {};
        const profitMarginData = profitMarginRes.ok ? await profitMarginRes.json() : {};

        setTotalRevenue(Number(revenue.totalRevenue) || 0);
        setTotalExpenses(Number(expenses.totalExpenses) || 0);
        setTotalProfit(Number(profit.totalProfit) || 0);
        setTotalCreditSales(Number(creditSales.totalCreditSales) || 0);
        const cf = cashFlowData && cashFlowData.cashFlow ? cashFlowData.cashFlow : {};
        setCashFlow(Object.entries(cf).map(([date, amount]) => ({ date, amount })));
        setRevenueByCategory(revenueByCategoryData.revenueByCategory || {});
        setExpensesByCategory(expensesByCategoryData.expensesByCategory || {});
        setProfitMargin(Array.isArray(profitMarginData.profitMargin) ? profitMarginData.profitMargin : []);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="h-[80vh] flex items-center justify-center">
        <Loader2Icon className="mx-auto h-12 w-12 animate-spin" />
      </div>
    );
  }

  return (
    <ResponsiveContainer variant="dashboard" padding="md">
      {/* Cards de métricas principales */}
      <ResponsiveGrid 
        cols={{ default: 1, sm: 2, lg: 4 }} 
        gap="md"
        className="mb-6"
      >
        <ResponsiveCard
          title="Ingresos Totales"
          size="sm"
          headerActions={<DollarSignIcon className="w-4 h-4 text-muted-foreground" />}
        >
          <Typography variant="h2" weight="bold">${totalRevenue.toFixed(2)}</Typography>
        </ResponsiveCard>
        
        <ResponsiveCard
          title="Gastos Totales"
          size="sm"
          headerActions={<DollarSignIcon className="w-4 h-4 text-muted-foreground" />}
        >
          <Typography variant="h2" weight="bold">${totalExpenses.toFixed(2)}</Typography>
        </ResponsiveCard>
        
        <ResponsiveCard
          title="Ganancia Total"
          size="sm"
          headerActions={<DollarSignIcon className="w-4 h-4 text-muted-foreground" />}
        >
          <Typography variant="h2" weight="bold">${totalProfit.toFixed(2)}</Typography>
        </ResponsiveCard>
        
        <ResponsiveCard
          title="Dinero Fiado"
          size="sm"
          headerActions={<DollarSignIcon className="w-4 h-4 text-orange-500" />}
        >
          <Typography variant="h2" weight="bold" className="text-orange-600">${totalCreditSales.toFixed(2)}</Typography>
          <Typography variant="micro" className="text-muted-foreground mt-1">Pendiente de cobro</Typography>
        </ResponsiveCard>
      </ResponsiveGrid>

      {/* Gráficos */}
      <ResponsiveGrid 
        cols={{ default: 1, md: 2, xl: 4 }} 
        gap="md"
      >
        <ResponsiveCard
          title="Ingresos por Categoría"
          headerActions={<PieChartIcon className="w-4 h-4 text-muted-foreground" />}
          fullHeight
        >
          <PiechartcustomChart data={revenueByCategory} className="aspect-auto" />
        </ResponsiveCard>
        
        <ResponsiveCard
          title="Gastos por Categoría"
          headerActions={<PieChartIcon className="w-4 h-4 text-muted-foreground" />}
          fullHeight
        >
          <PiechartcustomChart data={expensesByCategory} className="aspect-auto" />
        </ResponsiveCard>
        
        <ResponsiveCard
          title="Margen de Ganancia (ventas)"
          headerActions={<BarChartIcon className="w-4 h-4 text-muted-foreground" />}
          fullHeight
        >
          <BarchartChart data={profitMargin} className="aspect-auto" />
        </ResponsiveCard>
        
        <ResponsiveCard
          title="Flujo de Caja"
          headerActions={<DollarSignIcon className="w-4 h-4 text-muted-foreground" />}
          fullHeight
        >
          <LinechartChart data={cashFlow} className="aspect-auto" />
        </ResponsiveCard>
      </ResponsiveGrid>
    </ResponsiveContainer>
  );
}

function BarChartIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="12" x2="12" y1="20" y2="10" />
      <line x1="18" x2="18" y1="20" y2="4" />
      <line x1="6" x2="6" y1="20" y2="16" />
    </svg>
  );
}

function BarchartChart({ data, ...props }: { data: any[] } & React.HTMLAttributes<HTMLDivElement>) {
  const chartConfig = {
    margin: {
      label: "Margin",
      color: "hsl(var(--chart-1))",
    },
  } satisfies ChartConfig;
  return (
    <div {...props}>
      <ChartContainer config={chartConfig}>
        <BarChart accessibilityLayer data={data}>
          <CartesianGrid vertical={false} />
          <XAxis
            dataKey="date"
            tickLine={false}
            tickMargin={10}
            axisLine={false}
            tickFormatter={(value) => new Date(value).toLocaleDateString()}
          />
          <ChartTooltip
            cursor={false}
            content={<ChartTooltipContent indicator="dashed" />}
          />
          <Bar dataKey="margin" fill="var(--color-margin)" radius={4} />
        </BarChart>
      </ChartContainer>
    </div>
  );
}

function DollarSignIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="12" x2="12" y1="2" y2="22" />
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  );
}

function LinechartChart({ data, ...props }: { data: any[] } & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div {...props}>
      <ChartContainer
        config={{
          amount: {
            label: "Amount",
            color: "hsl(var(--chart-1))",
          },
        }}
      >
        <LineChart
          accessibilityLayer
          data={data}
          margin={{
            left: 12,
            right: 12,
          }}
        >
          <CartesianGrid vertical={false} />
          <XAxis
            dataKey="date"
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            tickFormatter={(value) => new Date(value).toLocaleDateString()}
          />
          <ChartTooltip
            cursor={false}
            content={<ChartTooltipContent hideLabel />}
          />
          <Line
            dataKey="amount"
            type="monotone"
            stroke="var(--color-amount)"
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ChartContainer>
    </div>
  );
}

function PieChartIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21.21 15.89A10 10 0 1 1 8 2.83" />
      <path d="M22 12A10 10 0 0 0 12 2v10z" />
    </svg>
  );
}

function PiechartcustomChart({ data, ...props }: { data: Record<string, number> } & React.HTMLAttributes<HTMLDivElement>) {
  const chartData = Object.entries(data).map(([category, value]) => ({
    category,
    value,
    fill: `var(--color-${category})`,
  }));

  const chartConfig = Object.fromEntries(
    Object.keys(data).map((category, index) => [
      category,
      {
        label: category,
        color: `hsl(var(--chart-${index + 1}))`,
      },
    ])
  ) as ChartConfig;

  return (
    <div {...props}>
      <ChartContainer config={chartConfig}>
        <PieChart>
          <ChartTooltip
            cursor={false}
            content={<ChartTooltipContent hideLabel />}
          />
          <Pie
            data={chartData}
            dataKey="value"
            nameKey="category"
            outerRadius={80}
          />
        </PieChart>
      </ChartContainer>
    </div>
  );
}

