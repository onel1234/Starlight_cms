import {
    LineChart,
    Line,
    AreaChart,
    Area,
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    Radar,
    Treemap
} from 'recharts';
import { RevenueData, ProjectStatusData, TaskProgressData, InventoryData, CustomerSatisfactionData } from '../../types/reports';

const COLORS = [
    '#3B82F6', // Blue
    '#10B981', // Green
    '#F59E0B', // Yellow
    '#EF4444', // Red
    '#8B5CF6', // Purple
    '#F97316', // Orange
    '#06B6D4', // Cyan
    '#84CC16', // Lime
    '#EC4899', // Pink
    '#6B7280'  // Gray
];

interface BaseChartProps {
    data: any[];
    height?: number;
    className?: string;
}

interface LineChartProps extends BaseChartProps {
    xKey: string;
    yKey: string;
    lineColor?: string;
    showGrid?: boolean;
    showLegend?: boolean;
}

export function CustomLineChart({
    data,
    xKey,
    yKey,
    height = 300,
    lineColor = COLORS[0],
    showGrid = true,
    showLegend = true,
    className = ""
}: LineChartProps) {
    return (
        <div className={className}>
            <ResponsiveContainer width="100%" height={height}>
                <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    {showGrid && <CartesianGrid strokeDasharray="3 3" />}
                    <XAxis dataKey={xKey} />
                    <YAxis />
                    <Tooltip />
                    {showLegend && <Legend />}
                    <Line
                        type="monotone"
                        dataKey={yKey}
                        stroke={lineColor}
                        strokeWidth={2}
                        dot={{ fill: lineColor, strokeWidth: 2, r: 4 }}
                        activeDot={{ r: 6 }}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}

interface MultiLineChartProps extends BaseChartProps {
    xKey: string;
    lines: Array<{
        key: string;
        color?: string;
        name?: string;
    }>;
    showGrid?: boolean;
    showLegend?: boolean;
}

export function MultiLineChart({
    data,
    xKey,
    lines,
    height = 300,
    showGrid = true,
    showLegend = true,
    className = ""
}: MultiLineChartProps) {
    return (
        <div className={className}>
            <ResponsiveContainer width="100%" height={height}>
                <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    {showGrid && <CartesianGrid strokeDasharray="3 3" />}
                    <XAxis dataKey={xKey} />
                    <YAxis />
                    <Tooltip />
                    {showLegend && <Legend />}
                    {lines.map((line, index) => (
                        <Line
                            key={line.key}
                            type="monotone"
                            dataKey={line.key}
                            stroke={line.color || COLORS[index % COLORS.length]}
                            strokeWidth={2}
                            name={line.name || line.key}
                            dot={{ strokeWidth: 2, r: 4 }}
                            activeDot={{ r: 6 }}
                        />
                    ))}
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}

interface AreaChartProps extends BaseChartProps {
    xKey: string;
    yKey: string;
    fillColor?: string;
    showGrid?: boolean;
    showLegend?: boolean;
}

export function CustomAreaChart({
    data,
    xKey,
    yKey,
    height = 300,
    fillColor = COLORS[0],
    showGrid = true,
    showLegend = true,
    className = ""
}: AreaChartProps) {
    return (
        <div className={className}>
            <ResponsiveContainer width="100%" height={height}>
                <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <defs>
                        <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={fillColor} stopOpacity={0.8} />
                            <stop offset="95%" stopColor={fillColor} stopOpacity={0.1} />
                        </linearGradient>
                    </defs>
                    {showGrid && <CartesianGrid strokeDasharray="3 3" />}
                    <XAxis dataKey={xKey} />
                    <YAxis />
                    <Tooltip />
                    {showLegend && <Legend />}
                    <Area
                        type="monotone"
                        dataKey={yKey}
                        stroke={fillColor}
                        fillOpacity={1}
                        fill="url(#colorGradient)"
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
}

interface BarChartProps extends BaseChartProps {
    xKey: string;
    yKey: string;
    barColor?: string;
    showGrid?: boolean;
    showLegend?: boolean;
    horizontal?: boolean;
}

export function CustomBarChart({
    data,
    xKey,
    yKey,
    height = 300,
    barColor = COLORS[0],
    showGrid = true,
    showLegend = true,
    horizontal = false,
    className = ""
}: BarChartProps) {
    return (
        <div className={className}>
            <ResponsiveContainer width="100%" height={height}>
                <BarChart
                    data={data}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    layout={horizontal ? 'horizontal' : 'vertical'}
                >
                    {showGrid && <CartesianGrid strokeDasharray="3 3" />}
                    <XAxis
                        dataKey={horizontal ? yKey : xKey}
                        type={horizontal ? 'number' : 'category'}
                    />
                    <YAxis
                        dataKey={horizontal ? xKey : yKey}
                        type={horizontal ? 'category' : 'number'}
                    />
                    <Tooltip />
                    {showLegend && <Legend />}
                    <Bar
                        dataKey={horizontal ? xKey : yKey}
                        fill={barColor}
                        radius={[4, 4, 0, 0]}
                    />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}

interface PieChartProps extends BaseChartProps {
    nameKey: string;
    valueKey: string;
    showLabels?: boolean;
    showLegend?: boolean;
    innerRadius?: number;
    outerRadius?: number;
}

export function CustomPieChart({
    data,
    nameKey,
    valueKey,
    height = 300,
    showLabels = true,
    showLegend = true,
    innerRadius = 0,
    outerRadius = 80,
    className = ""
}: PieChartProps) {
    const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
        const RADIAN = Math.PI / 180;
        const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
        const x = cx + radius * Math.cos(-midAngle * RADIAN);
        const y = cy + radius * Math.sin(-midAngle * RADIAN);

        return (
            <text
                x={x}
                y={y}
                fill="white"
                textAnchor={x > cx ? 'start' : 'end'}
                dominantBaseline="central"
                fontSize={12}
                fontWeight="bold"
            >
                {`${(percent * 100).toFixed(0)}%`}
            </text>
        );
    };

    return (
        <div className={className}>
            <ResponsiveContainer width="100%" height={height}>
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={showLabels ? renderCustomizedLabel : false}
                        outerRadius={outerRadius}
                        innerRadius={innerRadius}
                        fill="#8884d8"
                        dataKey={valueKey}
                    >
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip />
                    {showLegend && <Legend />}
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
}

interface RadarChartProps extends BaseChartProps {
    angleKey: string;
    radiusKey: string;
    fillColor?: string;
    strokeColor?: string;
}

export function CustomRadarChart({
    data,
    angleKey,
    radiusKey,
    height = 300,
    fillColor = COLORS[0],
    strokeColor = COLORS[0],
    className = ""
}: RadarChartProps) {
    return (
        <div className={className}>
            <ResponsiveContainer width="100%" height={height}>
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey={angleKey} />
                    <PolarRadiusAxis />
                    <Radar
                        name="Value"
                        dataKey={radiusKey}
                        stroke={strokeColor}
                        fill={fillColor}
                        fillOpacity={0.3}
                    />
                    <Tooltip />
                </RadarChart>
            </ResponsiveContainer>
        </div>
    );
}

// Specialized chart components for specific data types

interface RevenueChartProps {
    data: RevenueData[];
    height?: number;
    className?: string;
}

export function RevenueChart({ data, height = 300, className = "" }: RevenueChartProps) {
    return (
        <MultiLineChart
            data={data}
            xKey="month"
            lines={[
                { key: 'revenue', color: COLORS[1], name: 'Revenue' },
                { key: 'expenses', color: COLORS[3], name: 'Expenses' },
                { key: 'profit', color: COLORS[0], name: 'Profit' }
            ]}
            height={height}
            className={className}
        />
    );
}

interface ProjectStatusChartProps {
    data: ProjectStatusData[];
    height?: number;
    className?: string;
}

export function ProjectStatusChart({ data, height = 300, className = "" }: ProjectStatusChartProps) {
    return (
        <CustomPieChart
            data={data}
            nameKey="status"
            valueKey="count"
            height={height}
            className={className}
            innerRadius={40}
            outerRadius={100}
        />
    );
}

interface TaskProgressChartProps {
    data: TaskProgressData[];
    height?: number;
    className?: string;
}

export function TaskProgressChart({ data, height = 300, className = "" }: TaskProgressChartProps) {
    return (
        <CustomBarChart
            data={data}
            xKey="project"
            yKey="percentage"
            height={height}
            className={className}
            barColor={COLORS[4]}
            horizontal={true}
        />
    );
}

interface InventoryChartProps {
    data: InventoryData[];
    height?: number;
    className?: string;
}

export function InventoryChart({ data, height = 300, className = "" }: InventoryChartProps) {
    // Transform data to be compatible with Treemap
    const treemapData = data.map((item, index) => ({
        name: item.category,
        value: item.value,
        items: item.items,
        fill: COLORS[index % COLORS.length]
    }));

    return (
        <div className={className}>
            <ResponsiveContainer width="100%" height={height}>
                <Treemap
                    data={treemapData}
                    dataKey="value"
                    aspectRatio={4 / 3}
                    stroke="#fff"
                    fill={COLORS[2]}
                />
            </ResponsiveContainer>
        </div>
    );
}

interface CustomerSatisfactionChartProps {
    data: CustomerSatisfactionData[];
    height?: number;
    className?: string;
}

export function CustomerSatisfactionChart({ data, height = 300, className = "" }: CustomerSatisfactionChartProps) {
    return (
        <CustomAreaChart
            data={data}
            xKey="month"
            yKey="rating"
            height={height}
            className={className}
            fillColor={COLORS[5]}
        />
    );
}