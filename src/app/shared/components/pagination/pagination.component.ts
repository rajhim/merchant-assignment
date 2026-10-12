import { Component, computed, input, output } from '@angular/core';

@Component({
  selector: 'app-pagination',
  standalone: true,
  templateUrl: './pagination.component.html',
  styleUrl: './pagination.component.scss'
})
export class PaginationComponent {
  readonly page = input<number>(1);
  readonly pageSize = input<number>(5);
  readonly totalCount = input<number>(0);
  readonly totalPages = input<number>(1);
  readonly currentCount = input<number>(0);

  readonly pageChange = output<number>();

  readonly pages = computed(() => {
    const total = this.totalPages();
    const current = this.page();
    const maxVisible = 5;
    if (total <= maxVisible) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }
    let start = Math.max(1, current - 2);
    let end = Math.min(total, start + maxVisible - 1);
    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }
    const result: number[] = [];
    for (let i = start; i <= end; i++) {
      result.push(i);
    }
    return result;
  });

  readonly startEntry = computed(() => {
    if (this.totalCount() === 0) return 0;
    return (this.page() - 1) * this.pageSize() + 1;
  });

  readonly endEntry = computed(() => {
    if (this.totalCount() === 0) return 0;
    return (this.page() - 1) * this.pageSize() + this.currentCount();
  });

  goToPage(pageNum: number): void {
    if (pageNum >= 1 && pageNum <= this.totalPages() && pageNum !== this.page()) {
      this.pageChange.emit(pageNum);
    }
  }
}
