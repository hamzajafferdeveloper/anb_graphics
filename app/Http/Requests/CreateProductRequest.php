<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CreateProductRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'meta_title' => 'required|string|max:255',
            'meta_description' => 'required|string|max:255',

            'name' => 'required|string|max:255',
            'description' => 'nullable|string',

            'price' => 'required|numeric|min:0',
            'sale_price' => 'nullable|numeric|min:0|lte:price',
            'sale_start_at' => 'nullable|date',
            'sale_end_at' => 'nullable|date|after_or_equal:sale_start_at',

            'category_id' => 'required|integer|exists:product_categories,id',
            'brand_id' => 'required|integer|exists:product_brands,id',
            'type_id' => 'required|integer|exists:product_types,id',

            'material' => 'nullable|string|max:255',

            'colors' => 'nullable|array',
            'colors.*' => 'string|max:255',

            'keywords' => 'nullable|array',
            'keywords.*' => 'string|max:255',

            'images' => 'nullable|array',
            'images.*' => 'image|mimes:jpg,jpeg,png,webp|max:5120',
        ];
    }

    public function messages(): array
    {
        return [
            'images.*.image' => 'Each file must be a valid image.',
            'images.*.mimes' => 'Images must be JPG, JPEG, PNG, or WEBP.',
        ];
    }
}
