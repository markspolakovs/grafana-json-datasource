import { GrafanaTheme } from '@grafana/data';
import { Button, Icon, stylesFactory, useTheme } from '@grafana/ui';
import { css } from 'emotion';
import React from 'react';
import { Pair } from '../types';

interface Props {
  columns: string[];
  addRowLabel: string;
  values: Array<Pair<string, string[]>>
  onChange: (rows: Array<Pair<string, string[]>>) => void

  onBlur: () => void;
}

export const KeyMultiValueEditor = ({ columns, values, onChange, addRowLabel, onBlur }: Props) => {
  const theme = useTheme();
  const styles = getStyles(theme);

  const updateCell = (colIdx: number, rowIdx: number, valIdx: number, value: string) => {
    onChange(
      values
      .map(([key, vals]) => {
        if (colIdx === 0) {
          return [value, vals];
        } else if (colIdx === 1) {
          return [key, [...vals.slice(0, valIdx), value, ...vals.slice(valIdx + 1)]];
        } else {
          return [key, vals];
        }
      })
    );
  };

  const addRow = (i: number) => {
    onChange([...values.slice(0, i + 1), ['', ['']], ...values.slice(i + 1)]);
  };

  const removeRow = (i: number) => {
    onChange([...values.slice(0, i), ...values.slice(i + 1)]);
  };

  const addMultiValue = (row: number, i: number) => {
    onChange(values.map(([key, vals], rowIdx) => {
      if (rowIdx === row) {
        return [key, [...vals.slice(0, i + 1), '', ...vals.slice(i + 1)]];
      } else {
        return [key, vals];
      }
    }))
  }

  const removeMultiValue = (row: number, i: number) => {
    onChange(values.map(([key, vals], rowIdx) => {
      if (rowIdx === row) {
        return [key, [...vals.slice(0, i), ...vals.slice(i + 1)]];
      } else {
        return [key, vals];
      }
    }))
  }

  return values.length === 0 ? (
    <Button
      variant="secondary"
      onClick={() => {
        addRow(0);
      }}
    >
      {addRowLabel}
    </Button>
  ) : (
    <table className={styles.root}>
      <thead className={styles.thead}>
        <tr className={styles.row}>
          {columns.map((_, key) => (
            <th key={key} className={styles.th}>
              {_}
            </th>
          ))}
          <th className={styles.th}></th>
        </tr>
      </thead>
      <tbody className={styles.tbody}>
        {values.map((row, rowIdx) => (
          <tr key={rowIdx} className={styles.row}>
            {row.map((cell, colIdx) => (
              <td key={colIdx} className={styles.td}>
                {typeof cell === "string" ? (
                  <input
                  value={cell}
                  onChange={(e) => updateCell(colIdx, rowIdx, 0, e.currentTarget.value)}
                  onBlur={onBlur}
                  className={styles.input}
                />
                ) : (<table className={css`
                  width: 100%;
                  margin-right: 0;
                `}>
                  <tbody className={styles.tbody}>
                      {cell.map((val, valIdx) => (
                      <tr key={valIdx} className={styles.row}>
                        <td className={styles.td + " " + css`
                          width: 100%;
                        `}>
                        <input
                          value={val}
                          onChange={(e) => updateCell(colIdx, rowIdx, valIdx, e.currentTarget.value)}
                          onBlur={onBlur}
                          className={styles.input}
                        />
                        </td>
                          <td>
                            <div
                              className={css`
                                display: flex;
                                & > * {
                                  margin-right: ${theme.spacing.xs};
                                }
                                & > *:last-child {
                                  margin-right: 0;
                                }
                              `}
                            >
                              <a
                                className={css`
                                  display: flex;
                                  background: ${theme.colors.bg2};
                                  padding: ${theme.spacing.xs} ${theme.spacing.sm};
                                  align-items: center;
                                  border-radius: ${theme.border.radius.sm};
                                `}
                                onClick={() => addMultiValue(rowIdx, valIdx)}
                              >
                                <Icon name="plus" />
                              </a>
                              <a
                                className={css`
                                  display: flex;
                                  background: ${theme.colors.bg2};
                                  padding: ${theme.spacing.xs} ${theme.spacing.sm};
                                  align-items: center;
                                  border-radius: ${theme.border.radius.sm};
                                `}
                                onClick={() => removeMultiValue(rowIdx, valIdx)}
                              >
                                <Icon name="minus" />
                              </a>
                          </div>
                        </td>
                        </tr>
                    ))}
                  </tbody>
                </table>)}
              </td>
            ))}
            <td className={styles.td}>
              <div
                className={css`
                  display: flex;
                  & > * {
                    margin-right: ${theme.spacing.xs};
                  }
                  & > *:last-child {
                    margin-right: 0;
                  }
                `}
              >
                <a
                  className={css`
                    display: flex;
                    background: ${theme.colors.bg2};
                    padding: ${theme.spacing.xs} ${theme.spacing.sm};
                    align-items: center;
                    border-radius: ${theme.border.radius.sm};
                  `}
                  onClick={() => addRow(rowIdx)}
                >
                  <Icon name="plus" />
                </a>
                <a
                  className={css`
                    display: flex;
                    background: ${theme.colors.bg2};
                    padding: ${theme.spacing.xs} ${theme.spacing.sm};
                    align-items: center;
                    border-radius: ${theme.border.radius.sm};
                  `}
                  onClick={() => removeRow(rowIdx)}
                >
                  <Icon name="minus" />
                </a>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

const getStyles = stylesFactory((theme: GrafanaTheme) => {
  return {
    root: css`
      table-layout: auto;
      border: 1px solid ${theme.colors.formInputBorder};
      border-collapse: separate;
      border-radius: ${theme.border.radius.sm};
      border-spacing: 0;
      border-left: 0;
      width: 100%;
    `,
    thead: css`
      display: table-header-group;
      vertical-align: middle;
      border-color: inherit;
      border-collapse: separate;

      &:first-child tr:first-child th:first-child {
        border-radius: ${theme.border.radius.sm} 0 0 0;
      }
      &:last-child tr:last-child th:first-child {
        border-radius: 0 0 0 ${theme.border.radius.sm};
      }
    `,
    tbody: css`
      &:first-child tr:first-child td:first-child {
        border-radius: ${theme.border.radius.sm} 0 0 0;
      }

      &:last-child tr:last-child td:first-child {
        border-radius: 0 0 0 ${theme.border.radius.sm};
      }
    `,
    input: css`
      outline: none;
      border: 0;
      background: transparent;
      width: 100%;
    `,
    row: css`
      display: table-row;
      vertical-align: inherit;
      border-color: inherit;
    `,
    th: css`
      padding: ${theme.spacing.xs} ${theme.spacing.sm};
      border-left: solid ${theme.colors.formInputBorder} 1px;
      font-size: ${theme.typography.size.sm};
      color: ${theme.colors.textSemiWeak};
      font-weight: ${theme.typography.weight.regular};

      &:last-child {
        border-left: 0;
      }
    `,
    td: css`
      padding: ${theme.spacing.xs} ${theme.spacing.sm};
      border: 1px solid transparent;
      border-left: solid ${theme.colors.formInputBorder} 1px;
      border-top: solid ${theme.colors.formInputBorder} 1px;
      background-color: ${theme.colors.formInputBg};
      &:last-child {
        border-left: 0;
        width: 32px;
        padding-left: 0;
        padding-right: ${theme.spacing.xs};
      }
    `,
  };
});
