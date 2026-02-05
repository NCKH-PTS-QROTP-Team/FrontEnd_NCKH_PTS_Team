declare module 'react-native-chart-kit' {
    import { Component } from 'react';
    import { ViewStyle } from 'react-native';

    export interface ChartConfig {
        backgroundColor?: string;
        backgroundGradientFrom?: string;
        backgroundGradientFromOpacity?: number;
        backgroundGradientTo?: string;
        backgroundGradientToOpacity?: number;
        fillShadowGradient?: string;
        fillShadowGradientOpacity?: number;
        fillShadowGradientFrom?: string;
        fillShadowGradientFromOpacity?: number;
        fillShadowGradientTo?: string;
        fillShadowGradientToOpacity?: number;
        useShadowColorFromDataset?: boolean;
        color?: (opacity?: number) => string;
        labelColor?: (opacity?: number) => string;
        strokeWidth?: number;
        barPercentage?: number;
        barRadius?: number;
        decimalPlaces?: number;
        style?: ViewStyle;
        propsForBackgroundLines?: object;
        propsForLabels?: object;
        propsForVerticalLabels?: object;
        propsForHorizontalLabels?: object;
        propsForDots?: object;
    }

    export interface Dataset {
        data: number[];
        color?: (opacity: number) => string;
        colors?: Array<(opacity: number) => string>;
        strokeWidth?: number;
        withDots?: boolean;
    }

    export interface ChartData {
        labels?: string[];
        datasets: Dataset[];
        legend?: string[];
    }

    export interface AbstractChartProps {
        data: ChartData;
        width: number;
        height: number;
        chartConfig: ChartConfig;
        style?: ViewStyle;
        withHorizontalLabels?: boolean;
        withVerticalLabels?: boolean;
        withInnerLines?: boolean;
        withOuterLines?: boolean;
        withDots?: boolean;
        withShadow?: boolean;
        withScrollableDot?: boolean;
        withVerticalLines?: boolean;
        withHorizontalLines?: boolean;
        fromZero?: boolean;
        yAxisLabel?: string;
        yAxisSuffix?: string;
        yAxisInterval?: number;
        xAxisLabel?: string;
        segments?: number;
        transparent?: boolean;
        hidePointsAtIndex?: number[];
    }

    export interface LineChartProps extends AbstractChartProps {
        bezier?: boolean;
        getDotColor?: (dataPoint: any, index: number) => string;
        onDataPointClick?: (data: {
            index: number;
            value: number;
            dataset: Dataset;
            x: number;
            y: number;
            getColor: (opacity: number) => string;
        }) => void;
        decorator?: () => void;
        formatYLabel?: (yValue: string) => string;
        formatXLabel?: (xValue: string) => string;
    }

    export interface BarChartProps extends AbstractChartProps {
        showValuesOnTopOfBars?: boolean;
        showBarTops?: boolean;
        withCustomBarColorFromData?: boolean;
        flatColor?: boolean;
        fromNumber?: number;
    }

    export interface PieChartData {
        name: string;
        population: number;
        color: string;
        legendFontColor: string;
        legendFontSize: number;
    }

    export interface PieChartProps {
        data: PieChartData[];
        width: number;
        height: number;
        chartConfig: ChartConfig;
        accessor: string;
        backgroundColor?: string;
        paddingLeft?: string;
        center?: [number, number];
        absolute?: boolean;
        hasLegend?: boolean;
        style?: ViewStyle;
        avoidFalseZero?: boolean;
    }

    export class LineChart extends Component<LineChartProps> { }
    export class BarChart extends Component<BarChartProps> { }
    export class PieChart extends Component<PieChartProps> { }
    export class ProgressChart extends Component<any> { }
    export class ContributionGraph extends Component<any> { }
    export class StackedBarChart extends Component<any> { }
}
