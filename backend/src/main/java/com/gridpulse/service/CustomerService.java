package com.gridpulse.service;

import com.gridpulse.entity.Customer;
import com.gridpulse.exception.ResourceNotFoundException;
import com.gridpulse.repository.CustomerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class CustomerService {

    @Autowired
    private CustomerRepository customerRepository;

    public List<Customer> getAllCustomers() {
        return customerRepository.findAll();
    }

    public Customer getCustomerById(Long id) {
        return customerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found with id: " + id));
    }

    public Customer createCustomer(Customer customer) {
        return customerRepository.save(customer);
    }

    public Customer updateCustomer(Long id, Customer details) {
        Customer cust = getCustomerById(id);
        cust.setName(details.getName());
        cust.setEmail(details.getEmail());
        cust.setPhone(details.getPhone());
        cust.setAddress(details.getAddress());
        cust.setStatus(details.getStatus());
        cust.setAverageConsumptionKwh(details.getAverageConsumptionKwh());
        return customerRepository.save(cust);
    }

    public void deleteCustomer(Long id) {
        Customer cust = getCustomerById(id);
        customerRepository.delete(cust);
    }
}
