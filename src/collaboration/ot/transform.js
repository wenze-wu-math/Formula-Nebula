/**
 * Operational Transform (OT) Engine
 * Handles conflict resolution for concurrent edits
 * Based on the Jupiter algorithm for client-server synchronization
 */

export class OperationalTransform {
  constructor() {
    this.transformRules = {
      'insert-insert': this.transformInsertInsert.bind(this),
      'insert-delete': this.transformInsertDelete.bind(this),
      'delete-insert': this.transformDeleteInsert.bind(this),
      'delete-delete': this.transformDeleteDelete.bind(this),
    };
  }

  /**
   * Transform operation A against operation B
   * Returns transformed version of A that can be applied after B
   */
  transform(opA, opB) {
    const typeA = opA.edit.type;
    const typeB = opB.edit.type;
    const key = `${typeA}-${typeB}`;

    if (this.transformRules[key]) {
      return this.transformRules[key](opA, opB);
    }

    // For other operation types, apply default transformation
    return this.transformDefault(opA, opB);
  }

  /**
   * Transform INSERT against INSERT
   */
  transformInsertInsert(opA, opB) {
    const posA = opA.edit.position;
    const posB = opB.edit.position;

    if (posA.line < posB.line) {
      // A is before B, no transformation needed
      return opA;
    } else if (posA.line > posB.line) {
      // A is after B, shift position
      return {
        ...opA,
        edit: {
          ...opA.edit,
          position: {
            ...posA,
            line: posA.line + this.countNewlines(opB.edit.content)
          }
        }
      };
    } else {
      // Same line
      if (posA.column <= posB.column) {
        // A is before or at B's position
        return opA;
      } else {
        // A is after B on same line, shift column
        return {
          ...opA,
          edit: {
            ...opA.edit,
            position: {
              ...posA,
              column: posA.column + opB.edit.content.length
            }
          }
        };
      }
    }
  }

  /**
   * Transform INSERT against DELETE
   */
  transformInsertDelete(opA, opB) {
    const posA = opA.edit.position;
    const posB = opB.edit.position;
    const deleteEnd = this.calculateEndPosition(posB, opB.edit.length);

    if (this.isBeforePosition(posA, posB)) {
      // Insert is before delete, no transformation
      return opA;
    } else if (this.isAfterPosition(posA, deleteEnd)) {
      // Insert is after delete, adjust position
      const deletedLines = deleteEnd.line - posB.line;
      return {
        ...opA,
        edit: {
          ...opA.edit,
          position: {
            line: posA.line - deletedLines,
            column: posA.line === deleteEnd.line
              ? posA.column - (deleteEnd.column - posB.column)
              : posA.column
          }
        }
      };
    } else {
      // Insert is within deleted range, move to delete start
      return {
        ...opA,
        edit: {
          ...opA.edit,
          position: { ...posB }
        }
      };
    }
  }

  /**
   * Transform DELETE against INSERT
   */
  transformDeleteInsert(opA, opB) {
    const posA = opA.edit.position;
    const posB = opB.edit.position;

    if (this.isBeforePosition(posB, posA)) {
      // Insert is before delete, adjust delete position
      const insertedLines = this.countNewlines(opB.edit.content);
      return {
        ...opA,
        edit: {
          ...opA.edit,
          position: {
            line: posA.line + insertedLines,
            column: posA.line === posB.line
              ? posA.column + opB.edit.content.length
              : posA.column
          }
        }
      };
    } else {
      // Insert is after or within delete range
      return opA;
    }
  }

  /**
   * Transform DELETE against DELETE
   */
  transformDeleteDelete(opA, opB) {
    const posA = opA.edit.position;
    const posB = opB.edit.position;
    const endA = this.calculateEndPosition(posA, opA.edit.length);
    const endB = this.calculateEndPosition(posB, opB.edit.length);

    // Check for overlap
    if (this.rangesOverlap(posA, endA, posB, endB)) {
      // Calculate non-overlapping portion
      const newLength = this.calculateNonOverlap(posA, endA, posB, endB);

      if (newLength <= 0) {
        // Fully overlapped, mark as no-op
        return {
          ...opA,
          edit: {
            ...opA.edit,
            type: 'noop',
            length: 0
          }
        };
      }

      return {
        ...opA,
        edit: {
          ...opA.edit,
          length: newLength
        }
      };
    }

    // No overlap, adjust position if needed
    if (this.isAfterPosition(posA, endB)) {
      const deletedLines = endB.line - posB.line;
      return {
        ...opA,
        edit: {
          ...opA.edit,
          position: {
            line: posA.line - deletedLines,
            column: posA.line === endB.line
              ? posA.column - (endB.column - posB.column)
              : posA.column
          }
        }
      };
    }

    return opA;
  }

  /**
   * Default transformation for other operation types
   */
  transformDefault(opA, opB) {
    // For annotations and other operations, maintain temporal order
    if (opA.timestamp < opB.timestamp) {
      return opA;
    }
    return opA;
  }

  /**
   * Resolve conflicts between two operations
   * Returns merged operation that preserves intent of both
   */
  resolve(edit1, edit2) {
    // Determine priority based on user ID and timestamp
    const priority1 = this.calculatePriority(edit1);
    const priority2 = this.calculatePriority(edit2);

    if (priority1 > priority2) {
      return this.transform(edit1, edit2);
    } else if (priority2 > priority1) {
      return this.transform(edit2, edit1);
    } else {
      // Equal priority, merge both operations
      return this.mergeOperations(edit1, edit2);
    }
  }

  /**
   * Calculate operation priority for conflict resolution
   */
  calculatePriority(operation) {
    // Lower user ID has higher priority (consistent ordering)
    // Earlier timestamp has higher priority
    return operation.userId.localeCompare(operation.userId) * 1000000 - operation.timestamp;
  }

  /**
   * Merge two operations that don't conflict
   */
  mergeOperations(op1, op2) {
    return {
      userId: 'system',
      version: Math.max(op1.version, op2.version) + 1,
      edit: {
        type: 'composite',
        operations: [op1.edit, op2.edit]
      },
      timestamp: Date.now()
    };
  }

  // Helper methods

  countNewlines(text) {
    return (text.match(/\n/g) || []).length;
  }

  calculateEndPosition(startPos, length) {
    // Simplified calculation - in real implementation,
    // would need to traverse actual text content
    return {
      line: startPos.line,
      column: startPos.column + length
    };
  }

  isBeforePosition(pos1, pos2) {
    return pos1.line < pos2.line ||
           (pos1.line === pos2.line && pos1.column < pos2.column);
  }

  isAfterPosition(pos1, pos2) {
    return pos1.line > pos2.line ||
           (pos1.line === pos2.line && pos1.column > pos2.column);
  }

  rangesOverlap(start1, end1, start2, end2) {
    return !(this.isAfterPosition(start1, end2) || this.isBeforePosition(end1, start2));
  }

  calculateNonOverlap(start1, end1, start2, end2) {
    if (!this.rangesOverlap(start1, end1, start2, end2)) {
      return end1.column - start1.column; // Original length
    }

    // Calculate overlapping region
    const overlapStart = this.isAfterPosition(start1, start2) ? start1 : start2;
    const overlapEnd = this.isBeforePosition(end1, end2) ? end1 : end2;

    const originalLength = end1.column - start1.column;
    const overlapLength = overlapEnd.column - overlapStart.column;

    return originalLength - overlapLength;
  }
}
