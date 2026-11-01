# Breadth-First Search (BFS)

Source: [`src/algorithms/bfs.js`](../src/algorithms/bfs.js)

## Idea

BFS explores the state space **level by level**. It expands every node at depth 0, then every node at depth 1, then depth 2, and so on. A node is never expanded before all shallower nodes have been expanded.

Because every move costs the same (one slide), the first time BFS reaches the goal it has found a path with the **fewest possible moves**.

## Logic

1. Put the initial state in a **FIFO queue** and in a **visited set**.
2. Take the node at the front of the queue and **expand** it: generate its neighbors by sliding the empty cell Up, Down, Left, Right.
3. Skip any neighbor whose state is already in the visited set.
4. Add each new neighbor to the visited set and to the **back** of the queue.
5. Test each new neighbor against the goal **when it is generated**. If it is the goal, rebuild the path through the parent links and stop.
6. If the queue becomes empty, no solution exists.

### Why the visited set is required

The 8-puzzle state graph is full of cycles and of different paths leading to the same state. Without a visited set BFS would generate the same states again and again. With it, no state is ever generated twice. There are only 9!/2 = **181,440** reachable states, so the search is bounded by that number.

### Why test the goal at generation time

Testing when a node is *generated* instead of when it is *expanded* finds the goal one level earlier. This saves roughly one full level of nodes and does not change optimality.

## Pseudocode

```text
BFS(initial):
    root ← Node(state = initial, parent = null, move = null)
    if GOAL(root.state):
        return PATH(root)

    queue   ← [root]
    visited ← { root.state }

    while queue is not empty:
        node ← queue.dequeue()                    # front of the queue
        for each (state, move) in NEIGHBORS(node.state):
            if state in visited:
                continue
            visited.add(state)
            child ← Node(state, parent = node, move = move)
            if GOAL(state):
                return PATH(child)
            queue.enqueue(child)                  # back of the queue

    return FAILURE
```

## Implementation notes

- The queue is a plain array with a **head index** (`queue[head++]`) instead of `shift()`. Removing from the front of an array with `shift()` is O(n), while the head index makes dequeue O(1).
- States are turned into strings with `stateKey(state)` (for example `"1,2,3,4,5,6,7,8,0"`) so they can be stored in a `Set`.
- `maxFrontier` is measured as `queue.length - head`, the number of nodes waiting to be expanded.
- If `stats.generated` reaches `maxGenerated` (default 500,000, and 200,000 when started from the UI) the generator ends with `{ type: 'fail', reason: 'node-limit' }`.
- Neighbors are always produced in the order **Up, Down, Left, Right**, so runs are deterministic.

### Events emitted

| Event | When |
|---|---|
| `generate` | A node was created and added to the frontier (also the root). |
| `expand` | A node was taken from the queue and its children are about to be generated. |
| `goal` | The goal was found. Carries the full `path` from root to goal. |
| `fail` | `reason` is `exhausted` (queue empty) or `node-limit`. |

BFS never emits `prune` or `limit`.

## Complexity

Let `b` be the branching factor (about 2.67 on average for the 8-puzzle, about 1.67 once duplicates are excluded) and `d` the depth of the shallowest solution.

| Property | Value |
|---|---|
| Complete | Yes |
| Optimal | Yes (all moves cost 1) |
| Time | O(b^d) nodes generated, never more than the 181,440 reachable states |
| Space | O(b^d) for the frontier plus the visited set, bounded by 181,440 |

BFS keeps every node of the current level in memory, which is why its **Max frontier** grows quickly on deep puzzles. Memory, not time, is its main weakness.

## Example run

Initial state `0 5 2 1 8 3 4 7 6`, solution depth 8:

| Path length | Generated | Expanded | Max frontier |
|---|---|---|---|
| 8 | 155 | 92 | 63 |

## In the visualizer

The tree grows row by row, every level fully amber (frontier) and then blue (expanded) before the next level starts. When the goal is found, the path from the root to the goal turns green.

## When to use BFS

- You need the **shortest solution**.
- The solution is shallow, or memory is not a concern.

## Related

[DFS](DFS.md) · [IDS](IDS.md) · [Project README](../README.md)