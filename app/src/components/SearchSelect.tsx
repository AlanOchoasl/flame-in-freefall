import { useEffect, useId, useState } from 'react';
import type { KeyboardEvent } from 'react';
import { ChevronDown, X } from 'lucide-react';
import { filterOptions, moveActive, type SearchOption } from './searchOptions';

interface SearchSelectProps {
  /** Id of the text box, so a <label htmlFor> names it. */
  id: string;
  /** The chosen option's value, '' when none. */
  value: string;
  options: SearchOption[];
  placeholder: string;
  emptyText: string;
  /** Accessible name of the button that empties the menu. */
  clearLabel: string;
  disabled?: boolean;
  onChange: (value: string) => void;
}

// A menu you can search: type to narrow the list, arrow keys to move, Enter to choose, Escape to close.
// Follows the WAI-ARIA combobox pattern with a listbox popup. No library.
export function SearchSelect({ id, value, options, placeholder, emptyText, clearLabel, disabled = false, onChange }: SearchSelectProps) {
  const listId = useId();
  const [open, setOpen] = useState(false);
  // null: the box shows the chosen option; a string: the person is typing a search.
  const [query, setQuery] = useState<string | null>(null);
  const [activeRaw, setActive] = useState(0);

  const chosen = options.find((option) => option.value === value);
  const shown = filterOptions(options, query ?? '');
  const active = Math.min(activeRaw, Math.max(shown.length - 1, 0));
  const optionId = (index: number) => `${listId}-option-${index}`;

  useEffect(() => {
    if (open) document.getElementById(optionId(active))?.scrollIntoView({ block: 'nearest' });
  });

  const close = () => {
    setOpen(false);
    setQuery(null);
  };
  const choose = (option: SearchOption) => {
    onChange(option.value);
    close();
  };

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      if (!open) {
        setOpen(true);
        setActive(Math.max(shown.findIndex((option) => option.value === value), 0));
      } else {
        setActive(moveActive(active, shown.length, event.key === 'ArrowDown' ? 'down' : 'up'));
      }
    } else if (event.key === 'Enter' && open && shown[active]) {
      event.preventDefault();
      choose(shown[active]);
    } else if (event.key === 'Escape' && open) {
      event.preventDefault();
      close();
    }
  };

  return (
    <div className="combo">
      <input
        id={id}
        type="text"
        role="combobox"
        aria-expanded={open}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={open && shown[active] ? optionId(active) : undefined}
        autoComplete="off"
        spellCheck={false}
        placeholder={placeholder}
        disabled={disabled}
        value={query ?? chosen?.label ?? ''}
        onChange={(event) => {
          setQuery(event.target.value);
          setActive(0);
          setOpen(true);
        }}
        onFocus={(event) => {
          event.currentTarget.select();
          setActive(Math.max(shown.findIndex((option) => option.value === value), 0));
          setOpen(true);
        }}
        onClick={() => setOpen(true)}
        onBlur={close}
        onKeyDown={onKeyDown}
      />
      {value !== '' && !disabled ? (
        <button type="button" className="combo-clear icon-action" aria-label={clearLabel} title="Empty this menu" onClick={() => onChange('')}>
          <X className="action-icon" aria-hidden="true" />
        </button>
      ) : null}
      <ChevronDown className="combo-chevron" aria-hidden="true" />
      <ul id={listId} role="listbox" className="combo-list" hidden={!open}>
        {shown.map((option, index) => (
          <li
            key={option.value}
            id={optionId(index)}
            role="option"
            aria-selected={option.value === value}
            className={index === active ? 'combo-option is-active' : 'combo-option'}
            // Keep the focus in the text box: a click must not blur it before it chooses.
            onMouseDown={(event) => event.preventDefault()}
            onMouseMove={() => setActive(index)}
            onClick={() => choose(option)}
          >
            <span className="combo-label">{option.label}</span>
            {option.detail ? <span className="combo-detail">{option.detail}</span> : null}
          </li>
        ))}
        {shown.length === 0 ? (
          <li role="presentation" className="combo-empty">
            {emptyText}
          </li>
        ) : null}
      </ul>
      <span role="status" className="visually-hidden">
        {open ? (shown.length === 0 ? emptyText : `${shown.length} investigations`) : ''}
      </span>
    </div>
  );
}
