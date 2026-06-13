import axios from 'axios';
import React from 'react';
import { useForm, useFieldArray } from 'react-hook-form';

import styles from '@/components/TreatmentForm/treatmentForm.module.css';

export function TreatmentForm() {
  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      treatmentName: '',
      interval: '',
      medicines: [
        { name: '', dosage: '', quantity: '' },
      ],
    },
  });

  const { fields, append } = useFieldArray({
    control,
    name: 'medicines',
  });

  const onSubmit = async (data: {
    treatmentName: string;
    interval: string;
    medicines: Array<{ name: string; dosage: string; quantity: string }>;
  }) => {
    try {
      const response = await axios.post('/treatments',
        data,
        { withCredentials: true },
      );
      console.log(response.data);
      alert('Your treatment has been saved!');
    } catch (error) {
      console.error('Error:', error);
      alert('An error has occured');
    }
  };

  const addMedicine = () => {
    append({ name: '', dosage: '', quantity: '' });
  };

  return (

    <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>

      <div>
        <label htmlFor="treatmentName">Treatment Name</label>
        <input
          id="treatmentName"
          {...register('treatmentName', { required: true })}
          placeholder="Treatment name"
        />
        {errors.treatmentName && (
          <p style={{ color: 'red' }}>required</p>
        )}
      </div>

      <div>
        <label htmlFor="interval">Interval</label>
        <input
          id="interval"
          {...register('interval', { required: true })}
          placeholder="Hours between each take"
        />
        {errors.interval && (
          <p style={{ color: 'red' }}>required</p>
        )}
      </div>

      {fields.map((field, index) => (
        <div key={field.id} className={styles.medicineInfo}>
          <h4>{field.name ? field.name : `Medicine ${index + 1}`}</h4>

          <div>
            <label htmlFor={`medicine-name-${index}`}>Name</label>
            <input
              id={`medicine-name-${index}`}
              {...register(`medicines.${index}.name`, { required: true })}
              placeholder="Medicine name"
            />
            {errors.medicines?.[index]?.name && (
              <p style={{ color: 'red' }}>required</p>
            )}
          </div>

          <div>
            <label htmlFor={`medicine-dosage-${index}`}>Dosage</label>
            <input
              id={`medicine-dosage-${index}`}
              {...register(`medicines.${index}.dosage`, { required: true })}
              placeholder="Dosage of substance"
            />
            {errors.medicines?.[index]?.dosage && (
              <p style={{ color: 'red' }}>required</p>
            )}
          </div>

          <div>
            <label htmlFor={`medicine-quantity-${index}`}>Quantity</label>
            <input
              id={`medicine-quantity-${index}`}
              {...register(`medicines.${index}.quantity`, { required: true })}
              placeholder="Amount of pills"
            />
            {errors.medicines?.[index]?.quantity && (
              <p style={{ color: 'red' }}>required</p>
            )}
          </div>
        </div>
      ))}

      <button
        type="button"
        onClick={addMedicine}
        className={styles.addButton}
      >
        Add Medicine
      </button>

      <button
        type="submit"
        className={styles.submitButton}
      >
        Submit
      </button>
    </form>
  );
}
