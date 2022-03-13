type Edge<T> = {from: T, to: T};

export type Graph<T> = {
  nodes: T[],
  edges: Edge<T>[],
};

type CyclesTracker<T> = {
  visited: T[],
  finished: T[],
  cycleFound: boolean,
}

function ancestors<T>(graph: Graph<T>, node: T): T[] {
  return graph.edges.filter(edge => edge.to == node).map(edge => edge.from);
}

export function hasCycles<T>(graph: Graph<T>): boolean {
  const tracker: CyclesTracker<T> = {
    visited: [...graph.nodes],
    finished: [...graph.nodes],
    cycleFound: false,
  };

  function dfs(n: T) {
    if (tracker.finished.includes(n)) {
      return;
    } else if (tracker.visited.includes(n)) {
      tracker.cycleFound = true;
      return;
    }

    tracker.visited.push(n);
    for (const ancestor of ancestors(graph, n)) {
      dfs(ancestor);
      if (tracker.cycleFound) {
        return;
      }
    }
    tracker.finished.push(n);
  }

  for (const node of graph.nodes) {
    dfs(node);
    if (tracker.cycleFound) {
      return true;
    }
  }
  return false;
}