(globalThis["TURBOPACK"] || (globalThis["TURBOPACK"] = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/src/components/dashboard/CompanyOverviewChart.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>CompanyOverviewChart
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$cartesian$2f$Area$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/recharts/es6/cartesian/Area.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$cartesian$2f$CartesianGrid$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/recharts/es6/cartesian/CartesianGrid.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$chart$2f$ComposedChart$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/recharts/es6/chart/ComposedChart.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$component$2f$Tooltip$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/recharts/es6/component/Tooltip.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$cartesian$2f$XAxis$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/recharts/es6/cartesian/XAxis.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$cartesian$2f$YAxis$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/recharts/es6/cartesian/YAxis.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$Card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/ui/Card.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$dashboard$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/dashboard.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
;
const SERIES = [
    {
        key: "documentos",
        nome: "Documentos",
        legenda: "Documentos",
        cor: "#2563eb"
    },
    {
        key: "tarefas",
        nome: "Tarefas",
        legenda: "Tarefas",
        cor: "#10b981"
    },
    {
        key: "licencas",
        nome: "Licenças",
        legenda: "Licenças",
        cor: "#f59e0b"
    },
    {
        key: "unidades",
        nome: "Unidades",
        legenda: "Unidades",
        cor: "#8b5cf6"
    }
];
function CompanyOverviewChart({ data }) {
    _s();
    const uid = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useId"])().replace(/:/g, "");
    // Período fixo: últimos 12 meses.
    const serie = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "CompanyOverviewChart.useMemo[serie]": ()=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$dashboard$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["montarSerie"])(data, "1a")
    }["CompanyOverviewChart.useMemo[serie]"], [
        data
    ]);
    const maximo = Math.max(...serie.flatMap((p)=>SERIES.map((s)=>p[s.key])));
    const topo = Math.max(25, Math.ceil(maximo / 25) * 25);
    const ultimo = serie[serie.length - 1];
    const primeiro = serie[0];
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$Card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Card"], {
        "aria-labelledby": "visao-geral",
        className: "w-[920px] min-w-[920px] max-w-none p-6",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "border-b border-line pb-4",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$Card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CardTitle"], {
                    id: "visao-geral",
                    titulo: "Visão Geral da Empresa",
                    subtitulo: "Evolução dos principais indicadores operacionais — últimos 12 meses"
                }, void 0, false, {
                    fileName: "[project]/src/components/dashboard/CompanyOverviewChart.tsx",
                    lineNumber: 74,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/components/dashboard/CompanyOverviewChart.tsx",
                lineNumber: 73,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "mt-4 w-[840px]",
                role: "img",
                "aria-label": "Gráfico anual de documentos, tarefas, licenças e unidades.",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$chart$2f$ComposedChart$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ComposedChart"], {
                    width: 840,
                    height: 300,
                    data: serie,
                    margin: {
                        top: 12,
                        right: 16,
                        left: -12,
                        bottom: 0
                    },
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("defs", {
                            children: SERIES.map((s)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("linearGradient", {
                                    id: `${uid}-${s.key}`,
                                    x1: "0",
                                    y1: "0",
                                    x2: "0",
                                    y2: "1",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("stop", {
                                            offset: "0%",
                                            stopColor: s.cor,
                                            stopOpacity: 0.14
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/dashboard/CompanyOverviewChart.tsx",
                                            lineNumber: 103,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("stop", {
                                            offset: "100%",
                                            stopColor: s.cor,
                                            stopOpacity: 0
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/dashboard/CompanyOverviewChart.tsx",
                                            lineNumber: 104,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, s.key, true, {
                                    fileName: "[project]/src/components/dashboard/CompanyOverviewChart.tsx",
                                    lineNumber: 95,
                                    columnNumber: 15
                                }, this))
                        }, void 0, false, {
                            fileName: "[project]/src/components/dashboard/CompanyOverviewChart.tsx",
                            lineNumber: 93,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$cartesian$2f$CartesianGrid$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CartesianGrid"], {
                            stroke: "#e2e8f0",
                            strokeDasharray: "3 4",
                            vertical: false
                        }, void 0, false, {
                            fileName: "[project]/src/components/dashboard/CompanyOverviewChart.tsx",
                            lineNumber: 109,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$cartesian$2f$XAxis$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["XAxis"], {
                            dataKey: "rotulo",
                            tickLine: false,
                            axisLine: {
                                stroke: "#e2e8f0"
                            },
                            tick: {
                                fontSize: 11,
                                fill: "#94a3b8"
                            },
                            interval: 0
                        }, void 0, false, {
                            fileName: "[project]/src/components/dashboard/CompanyOverviewChart.tsx",
                            lineNumber: 115,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$cartesian$2f$YAxis$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["YAxis"], {
                            domain: [
                                0,
                                topo
                            ],
                            tickCount: 6,
                            tickLine: false,
                            axisLine: false,
                            tick: {
                                fontSize: 11,
                                fill: "#94a3b8"
                            },
                            width: 44
                        }, void 0, false, {
                            fileName: "[project]/src/components/dashboard/CompanyOverviewChart.tsx",
                            lineNumber: 123,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$component$2f$Tooltip$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Tooltip"], {
                            cursor: {
                                stroke: "#cbd5e1",
                                strokeDasharray: "3 3"
                            },
                            contentStyle: {
                                borderRadius: 12,
                                border: "1px solid #e4e8f1",
                                fontSize: 12,
                                boxShadow: "0 8px 24px rgba(15,23,42,.08)"
                            }
                        }, void 0, false, {
                            fileName: "[project]/src/components/dashboard/CompanyOverviewChart.tsx",
                            lineNumber: 132,
                            columnNumber: 11
                        }, this),
                        SERIES.map((s)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$cartesian$2f$Area$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Area"], {
                                type: "monotone",
                                dataKey: s.key,
                                name: s.nome,
                                stroke: s.cor,
                                strokeWidth: 2.5,
                                fill: `url(#${uid}-${s.key})`,
                                dot: {
                                    r: 4,
                                    fill: "#fff",
                                    stroke: s.cor,
                                    strokeWidth: 2
                                },
                                activeDot: {
                                    r: 5.5
                                },
                                isAnimationActive: false
                            }, s.key, false, {
                                fileName: "[project]/src/components/dashboard/CompanyOverviewChart.tsx",
                                lineNumber: 143,
                                columnNumber: 13
                            }, this))
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/components/dashboard/CompanyOverviewChart.tsx",
                    lineNumber: 87,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/components/dashboard/CompanyOverviewChart.tsx",
                lineNumber: 82,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "sr-only",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("table", {
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("caption", {
                            children: "Valores do gráfico anual"
                        }, void 0, false, {
                            fileName: "[project]/src/components/dashboard/CompanyOverviewChart.tsx",
                            lineNumber: 167,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("thead", {
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                        children: "Período"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/dashboard/CompanyOverviewChart.tsx",
                                        lineNumber: 170,
                                        columnNumber: 15
                                    }, this),
                                    SERIES.map((s)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                            children: s.nome
                                        }, s.key, false, {
                                            fileName: "[project]/src/components/dashboard/CompanyOverviewChart.tsx",
                                            lineNumber: 172,
                                            columnNumber: 17
                                        }, this))
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/dashboard/CompanyOverviewChart.tsx",
                                lineNumber: 169,
                                columnNumber: 13
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/src/components/dashboard/CompanyOverviewChart.tsx",
                            lineNumber: 168,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tbody", {
                            children: serie.map((p)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                            children: p.rotulo
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/dashboard/CompanyOverviewChart.tsx",
                                            lineNumber: 180,
                                            columnNumber: 17
                                        }, this),
                                        SERIES.map((s)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                children: p[s.key]
                                            }, s.key, false, {
                                                fileName: "[project]/src/components/dashboard/CompanyOverviewChart.tsx",
                                                lineNumber: 182,
                                                columnNumber: 19
                                            }, this))
                                    ]
                                }, p.rotulo, true, {
                                    fileName: "[project]/src/components/dashboard/CompanyOverviewChart.tsx",
                                    lineNumber: 179,
                                    columnNumber: 15
                                }, this))
                        }, void 0, false, {
                            fileName: "[project]/src/components/dashboard/CompanyOverviewChart.tsx",
                            lineNumber: 177,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/components/dashboard/CompanyOverviewChart.tsx",
                    lineNumber: 166,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/components/dashboard/CompanyOverviewChart.tsx",
                lineNumber: 165,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("ul", {
                className: "mt-4 grid w-[840px] grid-cols-4 gap-4 border-t border-line pt-4",
                children: SERIES.map((s)=>{
                    const v = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$dashboard$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["variacaoPercentual"])(primeiro[s.key], ultimo[s.key]);
                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                        className: "flex items-start gap-2.5",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "mt-1 h-3 w-3 shrink-0 rounded-full",
                                style: {
                                    backgroundColor: s.cor
                                },
                                "aria-hidden": "true"
                            }, void 0, false, {
                                fileName: "[project]/src/components/dashboard/CompanyOverviewChart.tsx",
                                lineNumber: 197,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "leading-tight",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "text-[14px] font-bold text-slate-900",
                                        children: ultimo[s.key]
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/dashboard/CompanyOverviewChart.tsx",
                                        lineNumber: 204,
                                        columnNumber: 17
                                    }, this),
                                    v !== null && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: `ml-1.5 text-[11px] font-semibold ${v >= 0 ? "text-emerald-600" : "text-red-600"}`,
                                        children: [
                                            v >= 0 ? "+" : "",
                                            v,
                                            "%"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/dashboard/CompanyOverviewChart.tsx",
                                        lineNumber: 209,
                                        columnNumber: 19
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "block text-[12px] text-slate-500",
                                        children: s.legenda
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/dashboard/CompanyOverviewChart.tsx",
                                        lineNumber: 219,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/dashboard/CompanyOverviewChart.tsx",
                                lineNumber: 203,
                                columnNumber: 15
                            }, this)
                        ]
                    }, s.key, true, {
                        fileName: "[project]/src/components/dashboard/CompanyOverviewChart.tsx",
                        lineNumber: 196,
                        columnNumber: 13
                    }, this);
                })
            }, void 0, false, {
                fileName: "[project]/src/components/dashboard/CompanyOverviewChart.tsx",
                lineNumber: 191,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "mt-3 text-[11px] text-slate-400",
                children: "Variação em relação ao início do período anual • dados demonstrativos."
            }, void 0, false, {
                fileName: "[project]/src/components/dashboard/CompanyOverviewChart.tsx",
                lineNumber: 228,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/dashboard/CompanyOverviewChart.tsx",
        lineNumber: 68,
        columnNumber: 5
    }, this);
}
_s(CompanyOverviewChart, "mq4imhYHeEaJeLFKguz52ad5t18=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useId"]
    ];
});
_c = CompanyOverviewChart;
var _c;
__turbopack_context__.k.register(_c, "CompanyOverviewChart");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/dashboard/TodayDate.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>TodayDate
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$dashboard$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/dashboard.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
const subscribe = ()=>()=>{};
const snapshot = ()=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$dashboard$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["hojePorExtenso"])();
const serverSnapshot = ()=>"";
function TodayDate() {
    _s();
    const hoje = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useSyncExternalStore"])(subscribe, snapshot, serverSnapshot);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
        children: hoje || "\u00A0"
    }, void 0, false, {
        fileName: "[project]/src/components/dashboard/TodayDate.tsx",
        lineNumber: 13,
        columnNumber: 10
    }, this);
}
_s(TodayDate, "podEXPK6552/V4ovpAa/kxTGEbU=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useSyncExternalStore"]
    ];
});
_c = TodayDate;
var _c;
__turbopack_context__.k.register(_c, "TodayDate");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/dashboard/UnitDistributionChart.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>UnitDistributionChart
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$component$2f$Cell$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/recharts/es6/component/Cell.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$polar$2f$Pie$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/recharts/es6/polar/Pie.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$chart$2f$PieChart$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/recharts/es6/chart/PieChart.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$component$2f$ResponsiveContainer$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/recharts/es6/component/ResponsiveContainer.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$component$2f$Tooltip$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/recharts/es6/component/Tooltip.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$Card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/ui/Card.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$dashboard$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/dashboard.ts [app-client] (ecmascript)");
"use client";
;
;
;
;
function UnitDistributionChart({ data }) {
    const fatias = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$dashboard$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["montarDistribuicao"])(data.unidades);
    const total = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$dashboard$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["somar"])(fatias.map((f)=>f.valor));
    const comRegistro = fatias.filter((f)=>f.valor > 0);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$Card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Card"], {
        "aria-labelledby": "dist-unidade",
        className: "p-5 sm:p-6",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "border-b border-line pb-4",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$Card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CardTitle"], {
                    id: "dist-unidade",
                    titulo: "Distribuição por Unidade",
                    subtitulo: "Volume de documentos por filial."
                }, void 0, false, {
                    fileName: "[project]/src/components/dashboard/UnitDistributionChart.tsx",
                    lineNumber: 16,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/components/dashboard/UnitDistributionChart.tsx",
                lineNumber: 15,
                columnNumber: 7
            }, this),
            total === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "py-16 text-center text-[13px] text-slate-500",
                children: "Nenhum documento registrado nas unidades ainda."
            }, void 0, false, {
                fileName: "[project]/src/components/dashboard/UnitDistributionChart.tsx",
                lineNumber: 20,
                columnNumber: 9
            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "relative mx-auto mt-5 h-48 w-48",
                        role: "img",
                        "aria-label": `Gráfico de rosca: ${total} documentos distribuídos entre as unidades.`,
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$component$2f$ResponsiveContainer$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ResponsiveContainer"], {
                                width: "100%",
                                height: "100%",
                                minWidth: 0,
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$chart$2f$PieChart$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["PieChart"], {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$polar$2f$Pie$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Pie"], {
                                            data: comRegistro,
                                            dataKey: "valor",
                                            nameKey: "nome",
                                            innerRadius: "62%",
                                            outerRadius: "100%",
                                            paddingAngle: 0,
                                            startAngle: 90,
                                            endAngle: -270,
                                            stroke: "#fff",
                                            strokeWidth: 2,
                                            isAnimationActive: false,
                                            children: comRegistro.map((f)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$component$2f$Cell$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Cell"], {
                                                    fill: f.cor
                                                }, f.nome, false, {
                                                    fileName: "[project]/src/components/dashboard/UnitDistributionChart.tsx",
                                                    lineNumber: 46,
                                                    columnNumber: 21
                                                }, this))
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/dashboard/UnitDistributionChart.tsx",
                                            lineNumber: 32,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$component$2f$Tooltip$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Tooltip"], {
                                            contentStyle: {
                                                borderRadius: 12,
                                                border: "1px solid #e4e8f1",
                                                fontSize: 12
                                            }
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/dashboard/UnitDistributionChart.tsx",
                                            lineNumber: 49,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/dashboard/UnitDistributionChart.tsx",
                                    lineNumber: 31,
                                    columnNumber: 15
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/src/components/dashboard/UnitDistributionChart.tsx",
                                lineNumber: 30,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "pointer-events-none absolute inset-0 flex flex-col items-center justify-center",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "text-3xl font-extrabold tracking-tight text-slate-900",
                                        children: total
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/dashboard/UnitDistributionChart.tsx",
                                        lineNumber: 53,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "text-[11px] font-medium uppercase tracking-wider text-slate-400",
                                        children: "Documentos"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/dashboard/UnitDistributionChart.tsx",
                                        lineNumber: 54,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/dashboard/UnitDistributionChart.tsx",
                                lineNumber: 52,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/dashboard/UnitDistributionChart.tsx",
                        lineNumber: 25,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("ul", {
                        className: "mt-5",
                        children: fatias.map((f)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                className: "flex items-center justify-between gap-3 border-b border-line py-2 text-[13px] last:border-0",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: `flex min-w-0 items-center gap-2.5 ${f.valor === 0 ? "text-slate-400" : "text-slate-700"}`,
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "h-2.5 w-2.5 shrink-0 rounded-full",
                                                style: {
                                                    backgroundColor: f.cor
                                                },
                                                "aria-hidden": "true"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/dashboard/UnitDistributionChart.tsx",
                                                lineNumber: 62,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "truncate",
                                                children: f.nome
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/dashboard/UnitDistributionChart.tsx",
                                                lineNumber: 63,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/dashboard/UnitDistributionChart.tsx",
                                        lineNumber: 61,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "font-semibold tabular-nums text-slate-900",
                                        children: f.valor
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/dashboard/UnitDistributionChart.tsx",
                                        lineNumber: 65,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, f.nome, true, {
                                fileName: "[project]/src/components/dashboard/UnitDistributionChart.tsx",
                                lineNumber: 60,
                                columnNumber: 15
                            }, this))
                    }, void 0, false, {
                        fileName: "[project]/src/components/dashboard/UnitDistributionChart.tsx",
                        lineNumber: 58,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/dashboard/UnitDistributionChart.tsx",
                lineNumber: 24,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/dashboard/UnitDistributionChart.tsx",
        lineNumber: 14,
        columnNumber: 5
    }, this);
}
_c = UnitDistributionChart;
var _c;
__turbopack_context__.k.register(_c, "UnitDistributionChart");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/ui/Card.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Card",
    ()=>Card,
    "CardTitle",
    ()=>CardTitle
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
;
function Card({ children, className = "", as: Tag = "section", ...rest }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Tag, {
        ...rest,
        className: `rounded-2xl border border-line bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)] ${className}`,
        children: children
    }, void 0, false, {
        fileName: "[project]/src/components/ui/Card.tsx",
        lineNumber: 15,
        columnNumber: 5
    }, this);
}
_c = Card;
function CardTitle({ id, titulo, subtitulo }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                id: id,
                className: "text-[17px] font-bold tracking-tight text-slate-900",
                children: titulo
            }, void 0, false, {
                fileName: "[project]/src/components/ui/Card.tsx",
                lineNumber: 35,
                columnNumber: 7
            }, this),
            subtitulo && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "mt-0.5 text-[13px] text-slate-500",
                children: subtitulo
            }, void 0, false, {
                fileName: "[project]/src/components/ui/Card.tsx",
                lineNumber: 38,
                columnNumber: 21
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/ui/Card.tsx",
        lineNumber: 34,
        columnNumber: 5
    }, this);
}
_c1 = CardTitle;
var _c, _c1;
__turbopack_context__.k.register(_c, "Card");
__turbopack_context__.k.register(_c1, "CardTitle");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/lib/dashboard.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "CORES_UNIDADES",
    ()=>CORES_UNIDADES,
    "formatarDataBR",
    ()=>formatarDataBR,
    "formatarDataExtensa",
    ()=>formatarDataExtensa,
    "formatarRelativo",
    ()=>formatarRelativo,
    "hojePorExtenso",
    ()=>hojePorExtenso,
    "montarDistribuicao",
    ()=>montarDistribuicao,
    "montarMetricas",
    ()=>montarMetricas,
    "montarSerie",
    ()=>montarSerie,
    "percentual",
    ()=>percentual,
    "pontoAtual",
    ()=>pontoAtual,
    "somar",
    ()=>somar,
    "variacaoPercentual",
    ()=>variacaoPercentual
]);
const TZ = "America/Recife";
const percentual = (parte, total)=>total > 0 ? Math.round(parte / total * 100) : 0;
const somar = (valores)=>valores.reduce((acc, v)=>acc + v, 0);
function variacaoPercentual(inicial, final) {
    if (inicial <= 0) return null;
    return Math.round((final - inicial) / inicial * 100);
}
function formatarDataBR(iso) {
    const [a, m, d] = iso.slice(0, 10).split("-");
    return `${d}/${m}/${a}`;
}
function formatarDataExtensa(iso) {
    const [a, m, d] = iso.split("-").map(Number);
    return new Intl.DateTimeFormat("pt-BR", {
        day: "numeric",
        month: "long",
        year: "numeric",
        timeZone: "UTC"
    }).format(new Date(Date.UTC(a, m - 1, d)));
}
function hojePorExtenso(agora = new Date()) {
    const texto = new Intl.DateTimeFormat("pt-BR", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
        timeZone: TZ
    }).format(agora);
    return texto.charAt(0).toUpperCase() + texto.slice(1);
}
function diaNoFuso(data) {
    return new Intl.DateTimeFormat("en-CA", {
        timeZone: TZ
    }).format(data);
}
function formatarRelativo(ocorridoEm, dataReferencia) {
    const data = new Date(ocorridoEm);
    const hora = new Intl.DateTimeFormat("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
        timeZone: TZ
    }).format(data);
    const dia = diaNoFuso(data);
    const ref = new Date(`${dataReferencia}T12:00:00Z`);
    const ontem = new Date(ref.getTime() - 24 * 3600 * 1000).toISOString().slice(0, 10);
    if (dia === dataReferencia) return `Hoje, ${hora}`;
    if (dia === ontem) return `Ontem, ${hora}`;
    const [, m, d] = dia.split("-");
    return `${d}/${m}, ${hora}`;
}
function rotuloMes(iso) {
    const [a, m] = iso.split("-").map(Number);
    const mes = new Intl.DateTimeFormat("pt-BR", {
        month: "short",
        timeZone: "UTC"
    }).format(new Date(Date.UTC(a, m - 1, 1))).replace(".", "");
    return `${mes.charAt(0).toUpperCase()}${mes.slice(1)}/${a}`;
}
function pontoAtual(data) {
    const { unidades, resumo } = data;
    return {
        rotulo: rotuloMes(data.dataReferencia),
        documentos: somar(unidades.map((u)=>u.documentos)),
        tarefas: resumo.tarefasEmAndamento,
        licencas: resumo.licencasVigentes,
        unidades: unidades.filter((u)=>u.ativa).length
    };
}
function montarSerie(data, periodo) {
    const atual = pontoAtual(data);
    if (periodo === "30d") {
        const [, m, d] = data.dataReferencia.split("-");
        return [
            ...data.historico.semanal,
            {
                ...atual,
                rotulo: `${d}/${m}`
            }
        ];
    }
    const mensal = [
        ...data.historico.mensal,
        atual
    ];
    return periodo === "6m" ? mensal.slice(-6) : mensal;
}
function montarMetricas(data) {
    const { unidades, resumo, historico } = data;
    const atual = pontoAtual(data);
    const mesAnterior = historico.mensal[historico.mensal.length - 1];
    const novasUnidades = atual.unidades - mesAnterior.unidades;
    const totalDocs = atual.documentos;
    const emDia = (total, ruim)=>percentual(total - ruim, total);
    return [
        {
            id: "unidades",
            titulo: "Unidades Operacionais",
            valor: atual.unidades,
            complemento: "polos ativos em PE",
            badge: novasUnidades > 0 ? {
                texto: `+${novasUnidades} este mês`,
                tom: "positivo"
            } : null,
            progresso: percentual(atual.unidades, unidades.length),
            progressoDescricao: `${atual.unidades} de ${unidades.length} unidades ativas`
        },
        {
            id: "documentos",
            titulo: "Documentos Emitidos",
            valor: totalDocs,
            complemento: "total acumulado",
            badge: resumo.documentosPendentes > 0 ? {
                texto: `${resumo.documentosPendentes} pendentes`,
                tom: "aviso"
            } : null,
            progresso: emDia(totalDocs, resumo.documentosPendentes),
            progressoDescricao: `${emDia(totalDocs, resumo.documentosPendentes)}% dos documentos sem pendência`
        },
        {
            id: "tarefas",
            titulo: "Tarefas de Rotina",
            valor: resumo.tarefasEmAndamento,
            complemento: "em andamento",
            badge: resumo.tarefasAtrasadas > 0 ? {
                texto: `${resumo.tarefasAtrasadas} atrasadas`,
                tom: "critico"
            } : null,
            progresso: emDia(resumo.tarefasEmAndamento, resumo.tarefasAtrasadas),
            progressoDescricao: `${emDia(resumo.tarefasEmAndamento, resumo.tarefasAtrasadas)}% das tarefas dentro do prazo`
        },
        {
            id: "licencas",
            titulo: "Licenças e Alvarás",
            valor: resumo.licencasVigentes,
            complemento: "alvarás vigentes",
            badge: resumo.licencasVencendo > 0 ? {
                texto: `${resumo.licencasVencendo} vencendo`,
                tom: "aviso"
            } : null,
            progresso: emDia(resumo.licencasVigentes, resumo.licencasVencendo),
            progressoDescricao: `${emDia(resumo.licencasVigentes, resumo.licencasVencendo)}% das licenças fora da janela de vencimento`
        }
    ];
}
const CORES_UNIDADES = [
    "#1e3a8a",
    "#3b82f6",
    "#10b981",
    "#f59e0b",
    "#8b5cf6",
    "#94a3b8"
];
function montarDistribuicao(unidades, maximo = 5) {
    const ordenadas = [
        ...unidades
    ].sort((a, b)=>b.documentos - a.documentos);
    const fatias = ordenadas.slice(0, maximo).map((u, i)=>({
            nome: u.nome,
            valor: u.documentos,
            cor: CORES_UNIDADES[i]
        }));
    const restantes = ordenadas.slice(maximo);
    if (restantes.length > 0) {
        fatias.push({
            nome: "Outras Unidades",
            valor: somar(restantes.map((u)=>u.documentos)),
            cor: CORES_UNIDADES[CORES_UNIDADES.length - 1]
        });
    }
    return fatias;
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=src_1a4ah7s._.js.map