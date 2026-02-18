import { Leaf, TrendingUp, Minus, BarChart3, Globe, TreePine, ArrowUpRight, ArrowDownRight, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useState, useMemo, Fragment } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts";
import { palmPriceData, monthOptions, getMonthlyData, getLatestPrice, getHighestPrice, getLowestPrice } from "@/data/palmPriceData";

interface PlantingAreaRow {
  area: string;
  standingArea2568: number;
  standingArea2569: number;
  standingAreaChange: number;
  productiveArea2568: number;
  productiveArea2569: number;
  productiveAreaChange: number;
  production2568: number;
  production2569: number;
  productionChange: number;
  yieldPerRai2568: number;
  yieldPerRai2569: number;
  yieldPerRaiChange: number;
}

const plantingData: PlantingAreaRow[] = [
  {
    area: "ประเทศไทย",
    standingArea2568: 6904189,
    standingArea2569: 7058536,
    standingAreaChange: 2.24,
    productiveArea2568: 6442430,
    productiveArea2569: 6584494,
    productiveAreaChange: 2.21,
    production2568: 19641663,
    production2569: 20201228,
    productionChange: 2.85,
    yieldPerRai2568: 3049,
    yieldPerRai2569: 3068,
    yieldPerRaiChange: 0.62,
  },
  {
    area: "ภาคใต้ตอนบน",
    standingArea2568: 5051432,
    standingArea2569: 5107236,
    standingAreaChange: 1.1,
    productiveArea2568: 4796951,
    productiveArea2569: 4951056,
    productiveAreaChange: 3.21,
    production2568: 15692982,
    production2569: 16362328,
    productionChange: 4.27,
    yieldPerRai2568: 3271,
    yieldPerRai2569: 3305,
    yieldPerRaiChange: 1.04,
  },
  {
    area: "สุราษฎร์ธานี",
    standingArea2568: 1552623,
    standingArea2569: 1578224,
    standingAreaChange: 1.65,
    productiveArea2568: 1449800,
    productiveArea2569: 1508600,
    productiveAreaChange: 4.06,
    production2568: 4842332,
    production2569: 5086999,
    productionChange: 5.05,
    yieldPerRai2568: 3340,
    yieldPerRai2569: 3372,
    yieldPerRaiChange: 0.96,
  },
];

function formatNumber(num: number): string {
  return num.toLocaleString("th-TH");
}

function ChangeIndicator({ value }: { value: number }) {
  if (value > 0) {
    return (
      <span className="inline-flex items-center gap-0.5 text-green-600 dark:text-green-400 text-xs font-medium">
        <ArrowUpRight className="h-3 w-3" />
        +{value.toFixed(2)}%
      </span>
    );
  }
  if (value < 0) {
    return (
      <span className="inline-flex items-center gap-0.5 text-red-600 dark:text-red-400 text-xs font-medium">
        <ArrowDownRight className="h-3 w-3" />
        {value.toFixed(2)}%
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-0.5 text-muted-foreground text-xs font-medium">
      <Minus className="h-3 w-3" />
      0.00%
    </span>
  );
}

type DataCategory = "standing" | "productive" | "production" | "yield";

const categories: { key: DataCategory; label: string; icon: typeof TreePine; unit: string }[] = [
  { key: "standing", label: "เนื้อที่ยืนต้น", icon: TreePine, unit: "ไร่" },
  { key: "productive", label: "เนื้อที่ให้ผล", icon: Leaf, unit: "ไร่" },
  { key: "production", label: "ผลผลิตรวม", icon: BarChart3, unit: "ตัน" },
  { key: "yield", label: "ผลผลิตต่อไร่", icon: TrendingUp, unit: "กก./ไร่" },
];

function getValueForCategory(row: PlantingAreaRow, category: DataCategory, year: "2568" | "2569"): number {
  switch (category) {
    case "standing":
      return year === "2568" ? row.standingArea2568 : row.standingArea2569;
    case "productive":
      return year === "2568" ? row.productiveArea2568 : row.productiveArea2569;
    case "production":
      return year === "2568" ? row.production2568 : row.production2569;
    case "yield":
      return year === "2568" ? row.yieldPerRai2568 : row.yieldPerRai2569;
  }
}

function getChangeForCategory(row: PlantingAreaRow, category: DataCategory): number {
  switch (category) {
    case "standing":
      return row.standingAreaChange;
    case "productive":
      return row.productiveAreaChange;
    case "production":
      return row.productionChange;
    case "yield":
      return row.yieldPerRaiChange;
  }
}

type PriceViewType = "palm" | "oil";

function PriceLatestCard() {
  const latest = getLatestPrice();
  const highest = getHighestPrice();
  const lowest = getLowestPrice();
  const prevEntry = palmPriceData[palmPriceData.length - 2];
  const priceDiff = latest.palmAvg - prevEntry.palmAvg;

  return (
    <Card data-testid="price-latest-card">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          ราคาปาล์มน้ำมันล่าสุด
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-3">
          <div className="p-3 rounded-lg bg-primary/5 text-center">
            <p className="text-xs text-muted-foreground mb-1">ราคาล่าสุด ({latest.date})</p>
            <p className="text-xl font-bold text-primary" data-testid="text-latest-palm-price">{latest.palmAvg.toFixed(2)}</p>
            <p className="text-xs text-muted-foreground">บาท/กก.</p>
            {priceDiff !== 0 && (
              <span className={`inline-flex items-center gap-0.5 text-xs font-medium mt-1 ${priceDiff > 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                {priceDiff > 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                {priceDiff > 0 ? "+" : ""}{priceDiff.toFixed(2)}
              </span>
            )}
          </div>
          <div className="p-3 rounded-lg bg-green-500/5 text-center">
            <p className="text-xs text-muted-foreground mb-1">สูงสุด</p>
            <p className="text-xl font-bold text-green-600 dark:text-green-400" data-testid="text-highest-palm-price">{highest.palmAvg.toFixed(2)}</p>
            <p className="text-xs text-muted-foreground">บาท/กก.</p>
            <p className="text-xs text-muted-foreground mt-1">{highest.date}</p>
          </div>
          <div className="p-3 rounded-lg bg-red-500/5 text-center">
            <p className="text-xs text-muted-foreground mb-1">ต่ำสุด</p>
            <p className="text-xl font-bold text-red-600 dark:text-red-400" data-testid="text-lowest-palm-price">{lowest.palmAvg.toFixed(2)}</p>
            <p className="text-xs text-muted-foreground">บาท/กก.</p>
            <p className="text-xs text-muted-foreground mt-1">{lowest.date}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function PriceChartCard() {
  const [viewType, setViewType] = useState<PriceViewType>("palm");

  const chartData = useMemo(() => {
    return palmPriceData.map((e) => ({
      label: `${e.day}/${e.month}`,
      avg: viewType === "palm" ? e.palmAvg : e.oilAvg,
      min: viewType === "palm" ? e.palmMin : e.oilMin,
      max: viewType === "palm" ? e.palmMax : e.oilMax,
    }));
  }, [viewType]);

  const minVal = Math.floor(Math.min(...chartData.map((d) => d.min)) - 1);
  const maxVal = Math.ceil(Math.max(...chartData.map((d) => d.max)) + 1);

  return (
    <Card data-testid="price-chart-card">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <CardTitle className="text-base flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            กราฟราคา ม.ค. - ก.ค. 2568
          </CardTitle>
          <div className="flex gap-1">
            <Button
              variant={viewType === "palm" ? "default" : "outline"}
              size="sm"
              className="text-xs"
              onClick={() => setViewType("palm")}
              data-testid="button-chart-palm"
            >
              ผลปาล์มคละ
            </Button>
            <Button
              variant={viewType === "oil" ? "default" : "outline"}
              size="sm"
              className="text-xs"
              onClick={() => setViewType("oil")}
              data-testid="button-chart-oil"
            >
              น้ำมันเกรด A
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-64 w-full" data-testid="price-chart">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -15, bottom: 5 }}>
              <defs>
                <linearGradient id="colorAvg" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 10 }}
                className="fill-muted-foreground"
                interval={Math.floor(chartData.length / 8)}
              />
              <YAxis
                domain={[minVal, maxVal]}
                tick={{ fontSize: 10 }}
                className="fill-muted-foreground"
                tickFormatter={(v: number) => v.toFixed(1)}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "6px",
                  fontSize: "12px",
                }}
                formatter={(value: number, name: string) => {
                  const labels: Record<string, string> = { avg: "เฉลี่ย", min: "ต่ำสุด", max: "สูงสุด" };
                  return [value.toFixed(2) + " บาท", labels[name] || name];
                }}
                labelFormatter={(label: string) => `วันที่ ${label}`}
              />
              <Area
                type="monotone"
                dataKey="avg"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                fill="url(#colorAvg)"
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="max"
                stroke="hsl(142.1 76.2% 36.3%)"
                strokeWidth={1}
                strokeDasharray="4 4"
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="min"
                stroke="hsl(0 84.2% 60.2%)"
                strokeWidth={1}
                strokeDasharray="4 4"
                dot={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="flex items-center justify-center gap-4 mt-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span className="w-4 h-0.5 bg-primary inline-block rounded" />
            เฉลี่ย
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-4 h-0.5 inline-block rounded" style={{ backgroundColor: "hsl(142.1, 76.2%, 36.3%)", borderStyle: "dashed" }} />
            สูงสุด
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-4 h-0.5 inline-block rounded" style={{ backgroundColor: "hsl(0, 84.2%, 60.2%)" }} />
            ต่ำสุด
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

function PriceTableCard() {
  const [selectedMonth, setSelectedMonth] = useState(256901);
  const monthData = useMemo(() => getMonthlyData(selectedMonth), [selectedMonth]);
  const monthLabel = monthOptions.find((m) => m.value === selectedMonth)?.label || "";

  return (
    <Card data-testid="price-table-card">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <CardTitle className="text-base flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            ตารางราคารายวัน
          </CardTitle>
          <Select value={String(selectedMonth)} onValueChange={(v) => setSelectedMonth(Number(v))}>
            <SelectTrigger className="w-auto gap-2" data-testid="select-month">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {monthOptions.map((m) => (
                <SelectItem key={m.value} value={String(m.value)} data-testid={`select-month-${m.value}`}>
                  {m.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto -mx-6 px-6">
          <table className="w-full text-sm" data-testid="price-data-table">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 pr-2 font-medium text-muted-foreground whitespace-nowrap">วันที่</th>
                <th className="text-center py-2 px-1 font-medium text-muted-foreground whitespace-nowrap" colSpan={3}>ผลปาล์มคละ (บาท/กก.)</th>
                <th className="text-center py-2 px-1 font-medium text-muted-foreground whitespace-nowrap" colSpan={3}>น้ำมันเกรด A (บาท/กก.)</th>
              </tr>
              <tr className="border-b">
                <th className="text-left py-1.5 pr-2 font-medium text-muted-foreground text-xs"></th>
                <th className="text-right py-1.5 px-1 font-medium text-muted-foreground text-xs whitespace-nowrap">ต่ำ</th>
                <th className="text-right py-1.5 px-1 font-medium text-muted-foreground text-xs whitespace-nowrap">สูง</th>
                <th className="text-right py-1.5 px-1 font-medium text-muted-foreground text-xs whitespace-nowrap">เฉลี่ย</th>
                <th className="text-right py-1.5 px-1 font-medium text-muted-foreground text-xs whitespace-nowrap">ต่ำ</th>
                <th className="text-right py-1.5 px-1 font-medium text-muted-foreground text-xs whitespace-nowrap">สูง</th>
                <th className="text-right py-1.5 px-1 font-medium text-muted-foreground text-xs whitespace-nowrap">เฉลี่ย</th>
              </tr>
            </thead>
            <tbody>
              {monthData.map((entry, idx) => {
                const prevEntry = idx > 0 ? monthData[idx - 1] : null;
                const showWeekHeader = idx === 0 || entry.week !== monthData[idx - 1]?.week;

                return (
                  <Fragment key={entry.date}>{showWeekHeader && (
                    <tr className="bg-muted/30">
                      <td colSpan={7} className="py-1.5 px-2 text-xs font-medium text-muted-foreground">
                        สัปดาห์ที่ {entry.week}
                      </td>
                    </tr>
                  )}
                  <tr
                    className="border-b last:border-b-0"
                    data-testid={`price-row-${entry.day}-${entry.month}`}
                  >
                    <td className="py-2 pr-2 font-medium tabular-nums whitespace-nowrap">{entry.day}</td>
                    <td className="text-right py-2 px-1 tabular-nums text-xs">{entry.palmMin.toFixed(2)}</td>
                    <td className="text-right py-2 px-1 tabular-nums text-xs">{entry.palmMax.toFixed(2)}</td>
                    <td className="text-right py-2 px-1 tabular-nums text-xs font-semibold">
                      <span className={
                        prevEntry
                          ? entry.palmAvg > prevEntry.palmAvg
                            ? "text-green-600 dark:text-green-400"
                            : entry.palmAvg < prevEntry.palmAvg
                              ? "text-red-600 dark:text-red-400"
                              : ""
                          : ""
                      }>
                        {entry.palmAvg.toFixed(2)}
                      </span>
                    </td>
                    <td className="text-right py-2 px-1 tabular-nums text-xs">{entry.oilMin.toFixed(2)}</td>
                    <td className="text-right py-2 px-1 tabular-nums text-xs">{entry.oilMax.toFixed(2)}</td>
                    <td className="text-right py-2 px-1 tabular-nums text-xs font-semibold">
                      <span className={
                        prevEntry
                          ? entry.oilAvg > prevEntry.oilAvg
                            ? "text-green-600 dark:text-green-400"
                            : entry.oilAvg < prevEntry.oilAvg
                              ? "text-red-600 dark:text-red-400"
                              : ""
                          : ""
                      }>
                        {entry.oilAvg.toFixed(2)}
                      </span>
                    </td>
                  </tr></Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="mt-3 p-3 rounded-lg bg-muted/30">
          <p className="text-xs text-muted-foreground leading-relaxed">
            ข้อมูลราคาสินค้าปาล์มน้ำมัน จังหวัดสุราษฎร์ธานี ปี 2568
            <br />
            <span className="text-green-600 dark:text-green-400">สีเขียว</span> = ราคาเพิ่มขึ้นจากวันก่อน,{" "}
            <span className="text-red-600 dark:text-red-400">สีแดง</span> = ราคาลดลงจากวันก่อน
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

function SuratHighlightCard() {
  const surat = plantingData[2];
  return (
    <Card data-testid="surat-highlight">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Globe className="h-5 w-5 text-primary" />
          สุราษฎร์ธานี (ปี 2569)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="p-3 rounded-lg bg-primary/5 text-center">
            <TreePine className="h-5 w-5 mx-auto text-primary mb-1.5" />
            <p className="text-lg font-bold" data-testid="text-surat-standing">{formatNumber(surat.standingArea2569)}</p>
            <p className="text-xs text-muted-foreground">ไร่ ยืนต้น</p>
            <ChangeIndicator value={surat.standingAreaChange} />
          </div>
          <div className="p-3 rounded-lg bg-green-500/5 text-center">
            <Leaf className="h-5 w-5 mx-auto text-green-600 dark:text-green-400 mb-1.5" />
            <p className="text-lg font-bold" data-testid="text-surat-productive">{formatNumber(surat.productiveArea2569)}</p>
            <p className="text-xs text-muted-foreground">ไร่ ให้ผล</p>
            <ChangeIndicator value={surat.productiveAreaChange} />
          </div>
          <div className="p-3 rounded-lg bg-orange-500/5 text-center">
            <BarChart3 className="h-5 w-5 mx-auto text-orange-600 dark:text-orange-400 mb-1.5" />
            <p className="text-lg font-bold" data-testid="text-surat-production">{formatNumber(surat.production2569)}</p>
            <p className="text-xs text-muted-foreground">ตัน ผลผลิต</p>
            <ChangeIndicator value={surat.productionChange} />
          </div>
          <div className="p-3 rounded-lg bg-blue-500/5 text-center">
            <TrendingUp className="h-5 w-5 mx-auto text-blue-600 dark:text-blue-400 mb-1.5" />
            <p className="text-lg font-bold" data-testid="text-surat-yield">{formatNumber(surat.yieldPerRai2569)}</p>
            <p className="text-xs text-muted-foreground">กก./ไร่</p>
            <ChangeIndicator value={surat.yieldPerRaiChange} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function DataComparisonTable({ selectedCategory }: { selectedCategory: DataCategory }) {
  const cat = categories.find((c) => c.key === selectedCategory)!;

  return (
    <Card data-testid="data-comparison-table">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <CardTitle className="text-base flex items-center gap-2">
            <cat.icon className="h-5 w-5 text-primary" />
            {cat.label}
          </CardTitle>
          <Badge variant="outline">หน่วย: {cat.unit}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto -mx-6 px-6">
          <table className="w-full text-sm" data-testid="planting-data-table">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2.5 pr-3 font-medium text-muted-foreground whitespace-nowrap">พื้นที่</th>
                <th className="text-right py-2.5 px-3 font-medium text-muted-foreground whitespace-nowrap">ปี 2568</th>
                <th className="text-right py-2.5 px-3 font-medium text-muted-foreground whitespace-nowrap">ปี 2569</th>
                <th className="text-right py-2.5 pl-3 font-medium text-muted-foreground whitespace-nowrap">เปลี่ยนแปลง</th>
              </tr>
            </thead>
            <tbody>
              {plantingData.map((row, index) => (
                <tr
                  key={row.area}
                  className={`border-b last:border-b-0 ${index === 2 ? "bg-primary/5" : ""}`}
                  data-testid={`planting-row-${index}`}
                >
                  <td className="py-2.5 pr-3 font-medium whitespace-nowrap">
                    {row.area}
                    {index === 2 && (
                      <Badge variant="secondary" className="ml-2">
                        จังหวัดเรา
                      </Badge>
                    )}
                  </td>
                  <td className="text-right py-2.5 px-3 tabular-nums whitespace-nowrap">
                    {formatNumber(getValueForCategory(row, selectedCategory, "2568"))}
                  </td>
                  <td className="text-right py-2.5 px-3 tabular-nums font-semibold whitespace-nowrap">
                    {formatNumber(getValueForCategory(row, selectedCategory, "2569"))}
                  </td>
                  <td className="text-right py-2.5 pl-3 whitespace-nowrap">
                    <ChangeIndicator value={getChangeForCategory(row, selectedCategory)} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

function RSPOInfoCard() {
  return (
    <Card data-testid="rspo-info">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Leaf className="h-5 w-5 text-green-600 dark:text-green-400" />
          มาตรฐาน RSPO
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground leading-relaxed">
          RSPO (Roundtable on Sustainable Palm Oil) เป็นมาตรฐานสากลสำหรับการผลิตน้ำมันปาล์มอย่างยั่งยืน 
          โดยมุ่งเน้นการลดผลกระทบต่อสิ่งแวดล้อม การอนุรักษ์ทรัพยากรธรรมชาติ และการปฏิบัติที่เป็นธรรมต่อเกษตรกร
        </p>
        <div className="space-y-2">
          <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
            <div className="p-1.5 rounded-md bg-green-500/10 shrink-0">
              <Leaf className="h-4 w-4 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm font-medium">ลดการตัดไม้ทำลายป่า</p>
              <p className="text-xs text-muted-foreground">ห้ามแผ้วถางป่าเพื่อขยายพื้นที่ปลูกปาล์ม</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
            <div className="p-1.5 rounded-md bg-blue-500/10 shrink-0">
              <Globe className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm font-medium">การค้าที่เป็นธรรม</p>
              <p className="text-xs text-muted-foreground">เกษตรกรรายย่อยได้รับราคาที่ยุติธรรมและโปร่งใส</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
            <div className="p-1.5 rounded-md bg-orange-500/10 shrink-0">
              <BarChart3 className="h-4 w-4 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <p className="text-sm font-medium">การรับรองคุณภาพ</p>
              <p className="text-xs text-muted-foreground">ผลิตภัณฑ์ที่ผ่านมาตรฐาน RSPO ได้รับการยอมรับในตลาดโลก</p>
            </div>
          </div>
        </div>
        <div className="p-3 rounded-lg border bg-muted/30">
          <p className="text-xs text-muted-foreground leading-relaxed">
            พื้นที่ปลูกปาล์มน้ำมันที่ได้รับการรับรอง RSPO ในประเทศไทยมีแนวโน้มเพิ่มขึ้นอย่างต่อเนื่อง 
            โดยเฉพาะในจังหวัดสุราษฎร์ธานีซึ่งเป็นแหล่งผลิตปาล์มน้ำมันที่สำคัญที่สุดของประเทศ
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

type InfoTab = "price" | "planting" | "rspo";

export default function PalmInfoPage() {
  const [selectedCategory, setSelectedCategory] = useState<DataCategory>("standing");
  const [activeTab, setActiveTab] = useState<InfoTab>("price");

  return (
    <div className="p-4 max-w-2xl mx-auto space-y-4 pb-8" data-testid="palm-info-page">
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2.5 rounded-lg bg-primary/10">
          <Leaf className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-xl font-bold" data-testid="text-page-title">ข้อมูลปาล์ม</h1>
          <p className="text-sm text-muted-foreground">ข้อมูลราคา สถิติพื้นที่เพาะปลูก และมาตรฐาน</p>
        </div>
      </div>

      <Card data-testid="info-tab-selector">
        <CardContent className="p-3">
          <div className="grid grid-cols-3 gap-2">
            <Button
              variant={activeTab === "price" ? "default" : "outline"}
              size="sm"
              className="gap-1.5 text-xs"
              onClick={() => setActiveTab("price")}
              data-testid="button-tab-price"
            >
              <TrendingUp className="h-3.5 w-3.5" />
              ราคาปาล์ม
            </Button>
            <Button
              variant={activeTab === "planting" ? "default" : "outline"}
              size="sm"
              className="gap-1.5 text-xs"
              onClick={() => setActiveTab("planting")}
              data-testid="button-tab-planting"
            >
              <TreePine className="h-3.5 w-3.5" />
              พื้นที่เพาะปลูก
            </Button>
            <Button
              variant={activeTab === "rspo" ? "default" : "outline"}
              size="sm"
              className="gap-1.5 text-xs"
              onClick={() => setActiveTab("rspo")}
              data-testid="button-tab-rspo"
            >
              <Globe className="h-3.5 w-3.5" />
              RSPO
            </Button>
          </div>
        </CardContent>
      </Card>

      {activeTab === "price" && (
        <>
          <PriceLatestCard />
          <PriceChartCard />
          <PriceTableCard />
        </>
      )}

      {activeTab === "planting" && (
        <>
          <SuratHighlightCard />

          <Card data-testid="category-selector">
            <CardContent className="p-3">
              <p className="text-xs text-muted-foreground mb-2">เลือกหมวดข้อมูล:</p>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {categories.map((cat) => {
                  const isActive = selectedCategory === cat.key;
                  return (
                    <Button
                      key={cat.key}
                      variant={isActive ? "default" : "outline"}
                      size="sm"
                      className="gap-1.5 text-xs"
                      onClick={() => setSelectedCategory(cat.key)}
                      data-testid={`button-category-${cat.key}`}
                    >
                      <cat.icon className="h-3.5 w-3.5" />
                      {cat.label}
                    </Button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <DataComparisonTable selectedCategory={selectedCategory} />
        </>
      )}

      {activeTab === "rspo" && <RSPOInfoCard />}
    </div>
  );
}
