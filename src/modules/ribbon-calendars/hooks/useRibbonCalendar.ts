'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  getCurrentWeekRequest,
  getRibbonCalendarRequest,
  createRibbonCalendarRequest,
  updateRibbonCalendarRequest,
  type WeekEntry,
  type CurrentWeekResponse,
  type RibbonCalendarResponse,
} from '../services/ribbon-calendar.service';
import { RIBBON_COLORS_CYCLE, RIBBON_COLOR_SPECIAL } from '@/@common/constants/ribbon-colors';
import type { RibbonColor } from '@/@common/constants/ribbon-colors';
import useRequest from '@/@common/hooks/useRequest';

function buildWeeks(startColorIndex: number): WeekEntry[] {
  return Array.from({ length: 52 }, (_, i) => {
    const week = i + 1;
    const color: RibbonColor =
      week === 53
        ? RIBBON_COLOR_SPECIAL
        : RIBBON_COLORS_CYCLE[(startColorIndex + week - 1) % RIBBON_COLORS_CYCLE.length];
    return { week, color };
  });
}

export function useRibbonCalendar(cooperativeId: string, year: number) {
  const [currentWeek, setCurrentWeek] = useState<CurrentWeekResponse | null>(null);
  const [weeks, setWeeks] = useState<WeekEntry[]>([]);
  const [startColorIndex, setStartColorIndex] = useState(0);
  const [calendarExists, setCalendarExists] = useState(false);
  const [loading, setLoading] = useState(true);

  const { handleRequest: execConfigure } = useRequest<RibbonCalendarResponse>();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [cw, calendar] = await Promise.allSettled([
        getCurrentWeekRequest(cooperativeId),
        getRibbonCalendarRequest(cooperativeId, year),
      ]);

      if (cw.status === 'fulfilled') setCurrentWeek(cw.value);

      if (calendar.status === 'fulfilled') {
        setWeeks(calendar.value.weeks);
        setStartColorIndex(calendar.value.startColorIndex);
        setCalendarExists(true);
      } else {
        setWeeks(buildWeeks(0));
        setStartColorIndex(0);
        setCalendarExists(false);
      }
    } finally {
      setLoading(false);
    }
  }, [cooperativeId, year]);

  useEffect(() => { load(); }, [load]);

  const configure = async (newIndex: number) => {
    const fn = calendarExists
      ? () => updateRibbonCalendarRequest(cooperativeId, year, newIndex)
      : () => createRibbonCalendarRequest(cooperativeId, year, newIndex);

    const result = await execConfigure(fn);
    if (result) {
      setWeeks(result.weeks);
      setStartColorIndex(result.startColorIndex);
      setCalendarExists(true);
    }
  };

  return { currentWeek, weeks, startColorIndex, calendarExists, loading, configure };
}
