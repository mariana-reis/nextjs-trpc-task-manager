import { render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useOnIntersect } from "./useOnIntersect";

class MockIntersectionObserver {
  static instances: MockIntersectionObserver[] = [];
  observe = vi.fn();
  disconnect = vi.fn();

  constructor(private callback: IntersectionObserverCallback) {
    MockIntersectionObserver.instances.push(this);
  }

  trigger(isIntersecting: boolean) {
    this.triggerEntries([{ isIntersecting } as IntersectionObserverEntry]);
  }

  triggerEntries(entries: IntersectionObserverEntry[]) {
    this.callback(entries, this as unknown as IntersectionObserver);
  }
}

function Probe({
  enabled,
  onIntersect,
  renderElement = true,
}: {
  enabled: boolean;
  onIntersect: () => void;
  renderElement?: boolean;
}) {
  const ref = useOnIntersect<HTMLDivElement>(onIntersect, enabled);
  return renderElement ? <div ref={ref} /> : null;
}

beforeEach(() => {
  MockIntersectionObserver.instances = [];
  vi.stubGlobal("IntersectionObserver", MockIntersectionObserver);
});

afterEach(() => vi.unstubAllGlobals());

describe("useOnIntersect", () => {
  it("calls the handler when the element enters the viewport", () => {
    const onIntersect = vi.fn();
    render(<Probe enabled onIntersect={onIntersect} />);

    MockIntersectionObserver.instances[0]?.trigger(true);

    expect(onIntersect).toHaveBeenCalledTimes(1);
  });

  it("ignores entries that are not intersecting", () => {
    const onIntersect = vi.fn();
    render(<Probe enabled onIntersect={onIntersect} />);

    MockIntersectionObserver.instances[0]?.trigger(false);

    expect(onIntersect).not.toHaveBeenCalled();
  });

  it("ignores empty observer entries", () => {
    const onIntersect = vi.fn();
    render(<Probe enabled onIntersect={onIntersect} />);

    MockIntersectionObserver.instances[0]?.triggerEntries([]);

    expect(onIntersect).not.toHaveBeenCalled();
  });

  it("does not observe while disabled", () => {
    render(<Probe enabled={false} onIntersect={vi.fn()} />);

    expect(MockIntersectionObserver.instances).toHaveLength(0);
  });

  it("does not observe when the ref has no element", () => {
    render(<Probe enabled onIntersect={vi.fn()} renderElement={false} />);

    expect(MockIntersectionObserver.instances).toHaveLength(0);
  });

  it("uses the latest callback without creating another observer", () => {
    const firstHandler = vi.fn();
    const nextHandler = vi.fn();
    const { rerender } = render(
      <Probe enabled onIntersect={firstHandler} />,
    );

    rerender(<Probe enabled onIntersect={nextHandler} />);
    MockIntersectionObserver.instances[0]?.trigger(true);

    expect(firstHandler).not.toHaveBeenCalled();
    expect(nextHandler).toHaveBeenCalledOnce();
    expect(MockIntersectionObserver.instances).toHaveLength(1);
  });

  it("loads when scroll or resize reaches the sentinel and ignores distant sentinels", () => {
    const onIntersect = vi.fn();
    const { container, rerender } = render(
      <Probe enabled onIntersect={onIntersect} />,
    );
    const node = container.firstElementChild as HTMLElement;
    let top = 100_000;
    vi.spyOn(node, "getBoundingClientRect").mockImplementation(
      () => ({ top }) as DOMRect,
    );

    window.dispatchEvent(new Event("scroll"));
    expect(onIntersect).not.toHaveBeenCalled();

    top = 0;
    window.dispatchEvent(new Event("scroll"));
    window.dispatchEvent(new Event("resize"));
    expect(onIntersect).toHaveBeenCalledTimes(2);

    rerender(<Probe enabled={false} onIntersect={onIntersect} />);
    onIntersect.mockClear();
    window.dispatchEvent(new Event("scroll"));
    window.dispatchEvent(new Event("resize"));
    expect(onIntersect).not.toHaveBeenCalled();
  });

  it("disconnects on unmount", () => {
    const { unmount } = render(<Probe enabled onIntersect={vi.fn()} />);
    const observer = MockIntersectionObserver.instances[0];

    unmount();

    expect(observer?.disconnect).toHaveBeenCalled();
  });
});
