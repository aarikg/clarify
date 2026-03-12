import { OutputData } from "./types";

export const processDocument = async (file: File | Blob | null): Promise<OutputData> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({
                document_type: "math_equation",
                summary: "A complex linear algebra matrix multiplication problem.",
                raw_latex: "\\begin{bmatrix} 1 & 2 \\\\ 3 & 4 \\end{bmatrix} \\begin{bmatrix} x \\\\ y \\end{bmatrix} = \\begin{bmatrix} 5 \\\\ 6 \\end{bmatrix}",
                audio_optimized_text: "This is a matrix multiplication equation. On the left side, there is a two by two matrix. Row one is 1, 2. Row two is 3, 4. This matrix is multiplied by a column vector containing variables x and y. This is equal to a column vector on the right side containing the constants 5 and 6."
            });
        }, 3000); // Simulate 3-second API call
    });
};
