import { useRef, useState, type Dispatch, type SetStateAction } from 'react';

type UseWorkbenchSummaryStateOptions<TTab extends string, TValue> = {
  createInitialTabs: () => TTab[];
  createNextTabLabel: (tabs: TTab[]) => TTab;
  createEmptyFieldValues: () => TValue;
  createInitialFieldValuesByTab: () => Record<TTab, TValue>;
  createInitialTextByTab: () => Record<TTab, string>;
};

export function useWorkbenchSummaryState<TTab extends string, TValue>({
  createInitialTabs,
  createNextTabLabel,
  createEmptyFieldValues,
  createInitialFieldValuesByTab,
  createInitialTextByTab,
}: UseWorkbenchSummaryStateOptions<TTab, TValue>) {
  const initialTabsRef = useRef<TTab[] | null>(null);

  if (initialTabsRef.current === null) {
    initialTabsRef.current = createInitialTabs();
  }

  const initialTabs = initialTabsRef.current;
  const [tabs, setTabs] = useState<TTab[]>(initialTabs);
  const [activeTab, setActiveTab] = useState<TTab>(initialTabs[0]);
  const [fieldValuesByTab, setFieldValuesByTab] =
    useState<Record<TTab, TValue>>(createInitialFieldValuesByTab);
  const [textByTab, setTextByTab] = useState<Record<TTab, string>>(createInitialTextByTab);

  const activeFieldValues = fieldValuesByTab[activeTab] ?? createEmptyFieldValues();
  const activeText = textByTab[activeTab] ?? '';

  const updateActiveFieldValues: Dispatch<SetStateAction<TValue>> = (updater) => {
    setFieldValuesByTab((previousValues) => {
      const currentValue = previousValues[activeTab] ?? createEmptyFieldValues();
      const nextValue =
        typeof updater === 'function'
          ? (updater as (previousValue: TValue) => TValue)(currentValue)
          : updater;

      return {
        ...previousValues,
        [activeTab]: nextValue,
      };
    });
  };

  const setActiveText = (nextText: string) => {
    setTextByTab((previousValues) => ({
      ...previousValues,
      [activeTab]: nextText,
    }));
  };

  const addTab = () => {
    const nextTab = createNextTabLabel(tabs);

    setTabs((previousTabs) => [...previousTabs, nextTab]);
    setFieldValuesByTab((previousValues) => ({
      ...previousValues,
      [nextTab]: createEmptyFieldValues(),
    }));
    setTextByTab((previousValues) => ({
      ...previousValues,
      [nextTab]: '',
    }));
    setActiveTab(nextTab);
  };

  const removeTab = (tab: TTab) => {
    setTabs((previousTabs) => {
      const nextTabs = previousTabs.filter((t) => t !== tab);
      if (nextTabs.length === 0) return previousTabs;
      if (activeTab === tab) {
        const removedIndex = previousTabs.indexOf(tab);
        const nextActive = nextTabs[Math.min(removedIndex, nextTabs.length - 1)];
        setActiveTab(nextActive);
      }
      return nextTabs;
    });
    setFieldValuesByTab((previousValues) => {
      const { [tab]: _, ...rest } = previousValues as Record<string, TValue>;
      return rest as unknown as Record<TTab, TValue>;
    });
    setTextByTab((previousValues) => {
      const { [tab]: _, ...rest } = previousValues as Record<string, string>;
      return rest as unknown as Record<TTab, string>;
    });
  };

  return {
    tabs,
    activeTab,
    setActiveTab,
    activeFieldValues,
    activeText,
    updateActiveFieldValues,
    setActiveText,
    addTab,
    removeTab,
  };
}
