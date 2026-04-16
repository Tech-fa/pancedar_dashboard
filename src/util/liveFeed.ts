import type {
    LiveFeedBatteryPoint,
    LiveFeedBatteryTrendPoint,
    LiveFeedEvent,
    LiveFeedMotor,
    LiveFeedMaintenanceBacklogPoint,
    LiveFeedPowerPoint,
    LiveFeedRiskPoint,
    LiveFeedSnapshot,
    LiveFeedTemperaturePoint,
    LiveFeedVibrationPoint
} from './interfaces'

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))

const randomWithin = (min: number, max: number) => min + Math.random() * (max - min)

const POLL_DELAY_RANGE = { min: 320, max: 650 }

const motorDefinitions = [
    { id: 'motor-1', label: 'Motor 1' },
    { id: 'motor-2', label: 'Motor 2' },
    { id: 'motor-3', label: 'Motor 3' },
    { id: 'motor-4', label: 'Motor 4' }
]

const eventTemplates: Array<Omit<LiveFeedEvent, 'id' | 'occurredAt'>> = [
    {
        severity: 'CRITICAL',
        summary: 'Motor 3 vibration spike detected',
        detail: 'Exceeds nominal envelope by 12%. Recommend immediate balancing check.'
    },
    {
        severity: 'WARNING',
        summary: 'ESC temperature trending upward',
        detail: 'Controllers trending 3°C above baseline across the last 2 minutes.'
    },
    {
        severity: 'INFO',
        summary: 'Battery capacity update',
        detail: 'State of charge nominal. Remaining endurance projected at 22 minutes.'
    },
    {
        severity: 'SYSTEM',
        summary: 'GNSS RTK correction reacquired',
        detail: 'Dual-band RTK link restored with HDOP 0.8.'
    }
]

const createInitialSnapshot = (vehicleId?: string): LiveFeedSnapshot => {
    const now = Date.now()

    const batteryState: LiveFeedBatteryPoint[] = [
        {
            timestamp: now,
            stateOfCharge: Number(clamp(93 + randomWithin(-0.5, 0.5), 80, 98).toFixed(1))
        }
    ]

    const batteryTrends: LiveFeedBatteryTrendPoint[] = [
        {
            timestamp: now,
            voltage: Number(clamp(24.8 + randomWithin(-0.2, 0.2), 23.5, 25.6).toFixed(2)),
            current: Number(clamp(10.5 + randomWithin(-1.2, 1.2), 6.5, 18.2).toFixed(1))
        }
    ]

    const powerConsumption: LiveFeedPowerPoint[] = [
        {
            timestamp: now,
            watts: Math.round(clamp(520 + randomWithin(-90, 110), 340, 780))
        }
    ]

    const temperatureBands: LiveFeedTemperaturePoint[] = [
        {
            timestamp: now,
            battery: Number(clamp(31 + randomWithin(-1.2, 1.6), 26, 38).toFixed(1)),
            esc: Number(clamp(44 + randomWithin(-1.5, 1.9), 36, 54).toFixed(1)),
            motor: Number(clamp(36 + randomWithin(-1.1, 1.4), 28, 45).toFixed(1))
        }
    ]

    const motors: LiveFeedMotor[] = motorDefinitions.map((definition, index) => {
        const load = Number(clamp(78 + index * 3 + randomWithin(-2, 2), 65, 92).toFixed(0))
        const status = load >= 90 ? 'WARNING' : 'NOMINAL'
        return {
            id: definition.id,
            label: definition.label,
            rpm: Math.round(2840 + randomWithin(-25, 25)),
            load,
            status
        }
    })

    const riskOutlook: LiveFeedRiskPoint[] = [
        { system: 'Battery', level: 3.1 },
        { system: 'Motors', level: 6.8 },
        { system: 'Propulsion', level: 2.4 },
        { system: 'Avionics', level: 1.6 },
        { system: 'Structure', level: 1.3 }
    ]

    const vibration: LiveFeedVibrationPoint[] = [
        {
            timestamp: now,
            magnitude: Number((1.6 + randomWithin(-0.15, 0.18)).toFixed(2))
        }
    ]

    const maintenanceBacklog: LiveFeedMaintenanceBacklogPoint[] = [
        {
            label: new Date(now).toLocaleString('en-US', {
                month: 'short',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
            }),
            openTasks: Math.round(clamp(32 + randomWithin(-6, 5), 8, 48))
        }
    ]

    const events: LiveFeedEvent[] = [
        {
            id: `${now - 120000}`,
            severity: 'CRITICAL',
            summary: 'Motor 3 vibration spike detected',
            detail: 'Exceeds nominal envelope by 12%. Recommend immediate balancing check.',
            occurredAt: now - 120000
        },
        {
            id: `${now - 270000}`,
            severity: 'WARNING',
            summary: 'ESC temperature trending upward',
            detail: 'Controllers trending 3°C above baseline across the last 2 minutes.',
            occurredAt: now - 270000
        },
        {
            id: `${now - 480000}`,
            severity: 'INFO',
            summary: 'Battery capacity update',
            detail: 'State of charge nominal. Remaining endurance projected at 22 minutes.',
            occurredAt: now - 480000
        },
        {
            id: `${now - 720000}`,
            severity: 'SYSTEM',
            summary: 'GNSS RTK correction reacquired',
            detail: 'Dual-band RTK link restored with HDOP 0.8.',
            occurredAt: now - 720000
        }
    ]

    const snapshot: LiveFeedSnapshot = {
        timestamp: now,
        asset: {
            id: vehicleId || 'asset-drn-07',
            name: vehicleId ? `Vehicle-${vehicleId.slice(-4)}` : 'Drone-07 Guardian',
            sessionId: `FLT-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}`,
            mode: 'Real-Time'
        },
        status: {
            flightStatus: 'OPERATIONAL',
            overallHealthScore: 93.4,
            flightStartAt: now - 26 * 60 * 1000,
            flightTimeSeconds: 26 * 60
        },
        telemetry: {
            battery: {
                voltage: 24.6,
                current: 11.8,
                stateOfCharge: batteryState[batteryState.length - 1]?.stateOfCharge ?? 88,
                remainingMinutes: 22.4
            },
            motors,
            temperatures: [
                {
                    id: 'battery-pack',
                    label: 'Battery Pack',
                    value: temperatureBands[temperatureBands.length - 1]?.battery ?? 31,
                    limit: 42,
                    status: 'NORMAL'
                },
                {
                    id: 'esc',
                    label: 'ESC',
                    value: temperatureBands[temperatureBands.length - 1]?.esc ?? 44,
                    limit: 55,
                    status: 'NORMAL'
                },
                {
                    id: 'motor',
                    label: 'Motor',
                    value: temperatureBands[temperatureBands.length - 1]?.motor ?? 36,
                    limit: 48,
                    status: 'NORMAL'
                }
            ],
            gnss: {
                status: 'Fixed',
                signalStrength: -143,
                satellites: 18,
                hdop: 0.9,
                correction: 'RTK FIX'
            }
        },
        envelope: {
            altitude: 127,
            speed: 18.3,
            pitch: -2.1,
            roll: 1.6,
            heading: 212
        },
        power: {
            consumptionWatts: powerConsumption[powerConsumption.length - 1]?.watts ?? 520,
            efficiency: 91.6
        },
        events,
        charts: {
            batteryState,
            batteryTrends,
            powerConsumption,
            temperatureBands,
            motorLoad: motors,
            riskOutlook,
            vibration,
            maintenanceBacklog
        }
    }

    return snapshot
}

const maybeInjectEvent = (events: LiveFeedEvent[], now: number): LiveFeedEvent[] => {
    const updated = events.map((event) => ({ ...event }))
    if (Math.random() > 0.35) {
        return updated.slice(0, 10)
    }

    const template = eventTemplates[Math.floor(Math.random() * eventTemplates.length)]
    updated.unshift({
        id: `${now}-${Math.random().toString(36).slice(2, 8)}`,
        occurredAt: now,
        severity: template.severity,
        summary: template.summary,
        detail: template.detail
    })

    return updated.slice(0, 10)
}

const updateEnvelope = (envelope: LiveFeedSnapshot['envelope']): LiveFeedSnapshot['envelope'] => {
    const altitude = clamp(envelope.altitude + randomWithin(-1.5, 2.4), 92, 178)
    const speed = clamp(envelope.speed + randomWithin(-0.8, 1.4), 14, 24.5)
    const pitch = clamp(envelope.pitch + randomWithin(-0.5, 0.5), -5.5, 8.5)
    const roll = clamp(envelope.roll + randomWithin(-1.2, 1.2), -7, 7)
    const heading = (envelope.heading + randomWithin(-2.5, 2.5) + 360) % 360

    return {
        altitude: Number(altitude.toFixed(1)),
        speed: Number(speed.toFixed(1)),
        pitch: Number(pitch.toFixed(1)),
        roll: Number(roll.toFixed(1)),
        heading: Number(heading.toFixed(0))
    }
}

const updateMotorLoad = (motors: LiveFeedMotor[]): LiveFeedMotor[] =>
    motors.map((motor) => {
        const load = Number(clamp(motor.load + randomWithin(-2.5, 2.5), 60, 98).toFixed(0))
        const rpm = Math.round(clamp(motor.rpm + randomWithin(-45, 55), 2550, 3100))
        const status = load >= 94 ? 'CRITICAL' : load >= 88 ? 'WARNING' : 'NOMINAL'
        return { ...motor, load, rpm, status }
    })

export const fetchLiveFeedSnapshot = async (
    previous?: LiveFeedSnapshot,
    vehicleId?: string
): Promise<LiveFeedSnapshot> => {
    const waitMs = Math.round(randomWithin(POLL_DELAY_RANGE.min, POLL_DELAY_RANGE.max))
    await delay(waitMs)

    const base = previous ?? createInitialSnapshot(vehicleId)
    const now = Date.now()

    const batteryVoltage = clamp(base.telemetry.battery.voltage - randomWithin(0.01, 0.08), 21.6, 25.8)
    const batteryCurrent = clamp(base.telemetry.battery.current + randomWithin(-0.7, 0.9), 7.2, 18.5)
    const stateOfCharge = clamp(base.telemetry.battery.stateOfCharge - randomWithin(0.3, 0.8), 28, 96)
    const remainingMinutes = clamp(base.telemetry.battery.remainingMinutes - randomWithin(0.6, 1.6), 12, 180)

    const batteryState: LiveFeedBatteryPoint[] = [
        {
            timestamp: now,
            stateOfCharge: Number(stateOfCharge.toFixed(1))
        }
    ]

    const temperatures = base.telemetry.temperatures.map((reading) => {
        const delta = randomWithin(-0.6, 0.9)
        const value = clamp(reading.value + delta, 24, reading.limit + 6)
        let status: 'NORMAL' | 'WARNING' | 'CRITICAL' = 'NORMAL'
        if (value >= reading.limit + 3) {
            status = 'CRITICAL'
        } else if (value >= reading.limit) {
            status = 'WARNING'
        }
        return { ...reading, value: Number(value.toFixed(1)), status }
    })

    const lastBatteryTrend = base.charts.batteryTrends[0]
    const batteryTrends: LiveFeedBatteryTrendPoint[] = [
        {
            timestamp: now,
            voltage: Number(
                clamp(
                    (lastBatteryTrend?.voltage ?? 24.5) - randomWithin(0.02, 0.08),
                    22.8,
                    25.6
                ).toFixed(2)
            ),
            current: Number(
                clamp(
                    (lastBatteryTrend?.current ?? 10.2) + randomWithin(-0.8, 1.1),
                    6.5,
                    19.5
                ).toFixed(1)
            )
        }
    ]

    const lastTemps = base.charts.temperatureBands[0]
    const temperatureBands: LiveFeedTemperaturePoint[] = [
        {
            timestamp: now,
            battery: Number(
                clamp((lastTemps?.battery ?? 31) + randomWithin(-0.6, 0.9), 24, 46).toFixed(1)
            ),
            esc: Number(
                clamp((lastTemps?.esc ?? 44) + randomWithin(-0.6, 1.1), 30, 58).toFixed(1)
            ),
            motor: Number(
                clamp((lastTemps?.motor ?? 36) + randomWithin(-0.6, 0.9), 26, 52).toFixed(1)
            )
        }
    ]

    const lastPower = base.charts.powerConsumption[0]
    const powerConsumption: LiveFeedPowerPoint[] = [
        {
            timestamp: now,
            watts: Math.round(
                clamp((lastPower?.watts ?? base.power.consumptionWatts) + randomWithin(-70, 110), 320, 820)
            )
        }
    ]

    const motorLoad = updateMotorLoad(base.telemetry.motors)

    const gnss = {
        ...base.telemetry.gnss,
        signalStrength: Math.round(clamp(base.telemetry.gnss.signalStrength + randomWithin(-1.5, 1.4), -150, -132)),
        satellites: Math.round(clamp(base.telemetry.gnss.satellites + randomWithin(-1, 1.2), 10, 24)),
        hdop: Number(clamp(base.telemetry.gnss.hdop + randomWithin(-0.06, 0.07), 0.6, 1.5).toFixed(2))
    }

    const riskOutlook = base.charts.riskOutlook.map((risk) => {
        const value = clamp(risk.level + randomWithin(-0.4, 0.6), 1, 10)
        return { ...risk, level: Number(value.toFixed(1)) }
    })

    const lastVibration = base.charts.vibration[0]
    const vibration: LiveFeedVibrationPoint[] = [
        {
            timestamp: now,
            magnitude: Number(
                clamp((lastVibration?.magnitude ?? 1.6) + randomWithin(-0.18, 0.2), 0.8, 2.6).toFixed(2)
            )
        }
    ]

    const lastBacklog = base.charts.maintenanceBacklog[0]
    const maintenanceBacklog: LiveFeedMaintenanceBacklogPoint[] = [
        {
            label: new Date(now).toLocaleString('en-US', {
                month: 'short',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
            }),
            openTasks: Math.round(
                clamp((lastBacklog?.openTasks ?? 30) + randomWithin(-1.8, 1.2), 6, 48)
            )
        }
    ]

    const events = maybeInjectEvent(base.events, now)

    const elapsedSeconds = Math.max(0, Math.round((now - base.timestamp) / 1000))
    const overallHealth = Number(
        clamp(base.status.overallHealthScore + randomWithin(-0.5, 0.5), 74, 96).toFixed(1)
    )

    return {
        timestamp: now,
        asset: base.asset,
        status: {
            ...base.status,
            overallHealthScore: overallHealth,
            flightTimeSeconds: base.status.flightTimeSeconds + elapsedSeconds
        },
        telemetry: {
            battery: {
                voltage: Number(batteryVoltage.toFixed(2)),
                current: Number(batteryCurrent.toFixed(1)),
                stateOfCharge: Number(stateOfCharge.toFixed(1)),
                remainingMinutes: Number(remainingMinutes.toFixed(1))
            },
            motors: motorLoad,
            temperatures,
            gnss
        },
        envelope: updateEnvelope(base.envelope),
        power: {
            consumptionWatts: powerConsumption[powerConsumption.length - 1]?.watts ?? base.power.consumptionWatts,
            efficiency: Number(clamp(base.power.efficiency + randomWithin(-0.5, 0.5), 84, 97).toFixed(1))
        },
        events,
        charts: {
            batteryState,
            batteryTrends,
            powerConsumption,
            temperatureBands,
            motorLoad,
            riskOutlook,
            vibration,
            maintenanceBacklog
        }
    }
}
