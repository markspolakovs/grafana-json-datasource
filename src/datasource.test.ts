import { dateTime, TimeRange } from '@grafana/data';
import { JsonField } from 'types';
import { JsonDataSource, replaceMacros } from './datasource';

jest.mock("@grafana/runtime", () => ({
  getTemplateSrv: jest.fn().mockReturnValue({
    replace: (x: any) => x,
    getVariables: () => []
  })
}));

const sampleTimestampFrom = '2021-05-17T20:48:09.000Z'; // -> 1621284489
const sampleTimestmapTo = '2021-05-17T20:50:23.000Z'; // -> 1621284623

const range: TimeRange = {
  from: dateTime(sampleTimestampFrom),
  to: dateTime(sampleTimestmapTo),
  raw: {
    from: sampleTimestampFrom,
    to: sampleTimestmapTo,
  },
};

test('range gets converted into ISO8601 notation', () => {
  expect(replaceMacros('$__isoFrom()', range)).toStrictEqual(sampleTimestampFrom);
  expect(replaceMacros('$__isoTo()', range)).toStrictEqual(sampleTimestmapTo);
});

test('range gets converted into unix epoch notation', () => {
  expect(replaceMacros('$__unixEpochFrom()', range)).toStrictEqual('1621284489');
  expect(replaceMacros('$__unixEpochTo()', range)).toStrictEqual('1621284623');
});

describe("field groups", () => {
  const dataSource = new JsonDataSource({
    id: 0,
    name: "JSON API",
    type: "JSON API",
    meta: {} as any,
    uid: "json-api",
    jsonData: {}
  });

  const baseRequest = {
    app: "",
    interval: "",
    intervalMs: 0,
    range: {
      from: dateTime(0),
      to: dateTime(0),
      raw: {
        from: dateTime(0),
          to: dateTime(0),
      }
    },
    requestId: "",
    scopedVars: {},
    startTime: 0,
    targets: [],
    timezone: "UTC",
  };

  const baseTarget = {
    body: "",
    cacheDurationSeconds: 0,
    fields: [{ jsonPath: "$[*].foo" }],
    headers: [],
    method: "get",
    params: [],
    queryParams: "",
    refId: "",
    urlPath: ""
  };

  test("no groups", async () => {
    dataSource.requestJson = jest.fn().mockResolvedValue([ { foo: "bar", abc: "def" }, { foo: "baz", abc: "ghj" } ]);
    const fields: JsonField[] = [
      { jsonPath: "$[*].foo" },
      { jsonPath: "$[*].abc" }
    ];

    const result = await dataSource.query({
      ...baseRequest,
      targets: [
        {
          ...baseTarget,
          fields
        }
      ]
    });
    expect(result.data).toHaveLength(1);
    expect(result.data[0].fields).toHaveLength(2);
    expect(result.data[0].fields[0].values.toArray()).toEqual(["bar", "baz"]);
    expect(result.data[0].fields[1].values.toArray()).toEqual(["def", "ghj"]);
  });

  test("top level group", async () => {
    dataSource.requestJson = jest.fn().mockResolvedValue([ { foo: "bar", abc: "def" }, { foo: "baz", abc: "ghj" } ]);
    const fields: JsonField[] = [
      {
        jsonPath: "$[*]",
        children: [
          { jsonPath: "$[*].foo" },
          { jsonPath: "$[*].abc" }
        ]
      }
    ];

    const result = await dataSource.query({
      ...baseRequest,
      targets: [
        {
          ...baseTarget,
          fields
        }
      ]
    });
    expect(result.data).toHaveLength(1);
    expect(result.data[0].fields).toHaveLength(2);
    expect(result.data[0].fields[0].values.toArray()).toEqual(["bar", "baz"]);
    expect(result.data[0].fields[1].values.toArray()).toEqual(["def", "ghj"]);
  });
});
