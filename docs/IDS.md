# Iterative Deepening Search (IDS)

Source: [`src/algorithms/ids.js`](../src/algorithms/ids.js)

## Idea

IDS combines the strengths of BFS and DFS. It runs a **depth-limited DFS** with limit 0, then with limit 1, then 2, and so on, until a solution is found.

- Like **BFS**, it finds the **shortest** solution, because the first limit that works is the depth of the shallowest goal.
- Like **DFS**, it keeps only one path in memory, so it needs very little space.

The price is that the upper levels of the tree are generated again in every iteration.

## Logic

1. For `limit = 0, 1, 2, …, maxDepth` (default **31**, the largest optimal solution depth of the 8-puzzle):
   1. Run a depth-limited DFS from the initial state. Nodes at depth `limit` are generated and goal-tested, but never expanded.
   2. If the goal is found, return the path. This path is optimal.
   3. If the search finished and **no node was cut off** by the limit, the whole reachable space was explored without finding the goal, so the puzzle has no solution. Stop with `exhausted`.
   4. If some node was cut off, a deeper solution may exist. Continue with `limit + 1`.
2. If every limit up to `maxDepth` is used without success, stop with `depth-limit`.

### Why repeating work is acceptable

In a tree with branching factor `b`, most nodes are at the deepest level. The upper levels are small compared with the last one, so regenerating them costs only a constant factor of extra work. For the 8-puzzle, with an effective branching factor around 1.67, the overhead is modest. The example below shows the real cost: IDS generated about 2.4 times more nodes than BFS on a shallow puzzle.

## Pseudocode

```text
IDS(initial, maxDepth):
    for limit = 0 to maxDepth:
        result ← DEPTH_LIMITED_SEARCH(initial, limit)
        if result is a path:
            return result
        if result == FAILURE:                 # nothing was cut off: no solution exists
            return FAILURE("exhausted")
        # result == CUTOFF → try the next, deeper limit
    return FAILURE("depth-limit")


DEPTH_LIMITED_SEARCH(initial, limit):
    root ← Node(state = initial, parent = null, move = null)
    if GOAL(root.state):
        return PATH(root)

    stack  ← [root]
    cutoff ← false

    while stack is not empty:
        node ← stack.pop()

        if node.depth ≥ limit:
            cutoff ← true                     # pruned: not expanded
            continue

        children ← []
        for each (state, move) in NEIGHBORS(node.state):
            if state is on the path root → node:
                continue                      # cycle check
            child ← Node(state, parent = node, move = move)
            if GOAL(state):
                return PATH(child)
            children.append(child)

        for child in REVERSE(children):
            stack.push(child)

    return cutoff ? CUTOFF : FAILURE
```

## Implementation notes

- IDS lives entirely in `ids.js`. The depth-limited search is a **private generator** (`depthLimitedSearch`) inside that file, and IDS does **not** import `dfs.js`. This keeps the three algorithms independent.
- The outer loop uses `yield*` to forward every event of the inner search to the caller, so the UI sees one continuous stream of events.
- At the start of every iteration IDS emits `{ type: 'limit', depthLimit }`. The visualizer **clears the tree** and starts drawing the new iteration from scratch, which is exactly what the algorithm is doing.
- **Statistics are cumulative.** `generated`, `expanded`, `maxFrontier` and `maxDepth` are shared across iterations, so they describe the total work of the whole search. The tree on screen shows only the current (or final) iteration, so its node count is much lower than `generated`.
- The inner search returns one of four results: `found`, `cutoff` (deeper search may help), `failure` (space exhausted) or `node-limit`.
- Each iteration creates a new root node. Node ids keep increasing across iterations because one node factory is shared.
- `maxGenerated` (default 500,000, and 200,000 from the UI) is counted over **all iterations together**. On hard puzzles IDS can therefore reach the node limit before BFS does.

### Events emitted

| Event | When |
|---|---|
| `limit` | A new iteration starts with the given `depthLimit`. |
| `generate` | A node was created (also the root of each iteration). |
| `expand` | A node was popped and expanded. |
| `prune` | A node at the depth limit was not expanded. |
| `goal` | The goal was found. Carries the `path`. |
| `fail` | `reason` is `exhausted`, `depth-limit` or `node-limit`. |

## Complexity

Let `b` be the branching factor and `d` the depth of the shallowest solution.

| Property | Value |
|---|---|
| Complete | Yes |
| Optimal | Yes (all moves cost 1) |
| Time | O(b^d). The repeated upper levels only add a constant factor. |
| Space | O(b·d) |

## Example run

Initial state `0 5 2 1 8 3 4 7 6`, solution depth 8:

| Path length | Generated | Expanded | Max frontier |
|---|---|---|---|
| 8 | 376 | 209 | 8 |

Compared with BFS on the same puzzle (155 generated, max frontier 63), IDS generated more nodes but kept only 8 nodes in memory instead of 63. The gap in memory grows rapidly as the puzzle gets deeper.

## Reading the Statistics panel

For an IDS run you will see two extra items:

- **IDS depth limit**: the limit of the current (or last) iteration. When a solution is found it equals the solution length.
- **IDS iteration**: the number of iterations performed. Because limits start at 0, finding a solution at depth 10 takes 11 iterations.

## In the visualizer

Each iteration redraws a small depth-limited tree. You will see the tree grow, get cleared and start again one level deeper. Red dashed nodes mark the frontier of each iteration, the nodes that hit the current limit.

## When to use IDS

- You want the **shortest** solution but cannot afford BFS's memory.
- You do not know the depth of the solution in advance. This is the standard choice for uninformed search on large state spaces.

## Related

[BFS](BFS.md) · [DFS](DFS.md) · [Project README](../README.md)