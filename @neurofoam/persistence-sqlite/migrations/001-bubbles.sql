-- Up
CREATE TABLE bubbles (
  bubbleUuid UUID PRIMARY KEY NOT NULL,
  currentStateJson TEXT NOT NULL,
  latestEventUuid UUID NULL
);

CREATE TABLE events (
  eventUuid UUID PRIMARY KEY NOT NULL,
  previousEventUuid UUID NULL,
  bubbleUuid UUID NOT NULL,
  sessionUuid UUID NOT NULL,
  eventJson TEXT NOT NULL,
  recorded DATETIME NOT NULL,
  FOREIGN KEY (bubbleUuid) REFERENCES bubbles(bubbleUuid),
  FOREIGN KEY (previousEventUuid) REFERENCES events(eventUuid)
);

-- Down
UPDATE bubbles SET latestEventId = NULL;
DELETE events;
DELETE bubbles;

DROP TABLE bubbles;
DROP TABLE events;
