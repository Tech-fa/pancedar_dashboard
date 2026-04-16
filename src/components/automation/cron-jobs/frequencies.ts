export interface FrequencyOption {
    label: string
    value: string
}

export const FREQUENCY_OPTIONS: FrequencyOption[] = [
    { label: 'Every Minute', value: '* * * * *' },
    { label: 'Every 5 Minutes', value: '*/5 * * * *' },
    { label: 'Every 10 Minutes', value: '*/10 * * * *' },
    { label: 'Every 15 Minutes', value: '*/15 * * * *' },
    { label: 'Every 30 Minutes', value: '*/30 * * * *' },
    { label: 'Every Hour', value: '0 * * * *' },
    { label: 'Every 2 Hours', value: '0 */2 * * *' },
    { label: 'Every 3 Hours', value: '0 */3 * * *' },
    { label: 'Every 4 Hours', value: '0 */4 * * *' },
    { label: 'Every 6 Hours', value: '0 */6 * * *' },
    { label: 'Every 8 Hours', value: '0 */8 * * *' },
    { label: 'Every 12 Hours', value: '0 */12 * * *' },
    { label: 'Every Day (midnight)', value: '0 0 * * *' },
    { label: 'Every Day (6 AM)', value: '0 6 * * *' },
    { label: 'Every Day (noon)', value: '0 12 * * *' },
    { label: 'Every Day (6 PM)', value: '0 18 * * *' },
    { label: 'Every Week (Monday midnight)', value: '0 0 * * 1' },
    { label: 'Every 2 Weeks (1st & 15th)', value: '0 0 1,15 * *' },
    { label: 'Every Month (1st, midnight)', value: '0 0 1 * *' },
]
